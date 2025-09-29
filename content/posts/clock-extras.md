+++
title = 'Clock Extras'
description = "The CPU clock isn't just an oscillator. It also includes some specific parts that allow it to work with the rest of the computer, and be useful to the intrepid builder."
date = 2025-09-21T14:17:11-07:00
draft = false
math = true
+++

## Introduction

We looked at the mechanisms for how clocks work and the types of
clocks used in the Theoputer in the [Clock Basics]({{<iref "clock.md"
>}}). But I skipped some of the important parts about how the specific
clock circuit/board integrate into the Theoputer. In particular, since
I am imperfect, I added two important features to the clock that have
made and continue to make development life easier:

1. A circuit that allows a person to press a button to generate a single clock pulse
1. Logic that allows the Theoputer to halt execution, by inhibiting the clock

At one point I had also included a reset line in the clock circuit,
but I never actually connected it up. I may revisit this decision at
some point because there are some oddities around whether the ~~RST~~
signal goes inactive during a down clock phase or an up clock phase.

## Generating Single Clock Pulses

This may seem like a trivial matter at first, and in the domain of
science and theory it is. But we live in the real world where things
are messy. In our real world generating a single pristine clock pulse
is quite a bit harder.

There are a few reasons for this. First, in order to provide an input
mechanism to a person we need to include something mechanical. There
are probably non-mechanical solutions, but those would likely have
similar issues. The problem with mechanical solutions (like a little
button switch) is that they don't behave perfectly. There will always
be some physical defects that prevent the mechanism from being
perfect. Often this means that the mechanism will "bounce" between its
states:

<fig-cite
    title="Bouncing switch on an oscilloscope"
    src="/img/clock-extras/debounce_bouncing.png"
    class="medium"
    href="https://hackaday.com/2015/12/09/embed-with-elliot-debounce-your-noisy-buttons-part-i/"></fig-cite>

This is what it looks like when you press a mechanical button like the
[tactile SPST buttons](https://www.digikey.com/en/products/detail/omron-electronics-inc-emc-div/B3FS-1000P/277812)
used all over the place in Theoputer. You can see the signal bouncing
between the low and high points. That's an issue if we were to use
this switch by itself as a clock pulse generator. All of those
transitions above 3.5V and below 1.5V (recall we're in CMOS logic
land) would be interpreted as individual clock pulses!

What we need is a way to *de*-bounce the bouncing signal. As usual
there are many ways to debounce a signal. Our approach will actually
be on the more complex end of debouncers.

What we want in the overly complex jargon of electrical engineering is
something called a monostable multivibrator. Multivibrator is a fancy
word for something that oscillates. Monostable means that thing that
can oscillate will always return to one (mono) state. It's stable at
that one state. This stability at one state is exactly what we want
out of a debouncer. We don't want the messy signal from the bouncing
input to alter the state of the output signal.

Let's look at a signal diagram first to see what this means in
practice:

![Monostable output from noisy input](img/clock-extras/4x/monostable@4x.png)
{class="padded-white small center"}

The idea is that we need something that can latch onto an input signal
and then stay high until enough time has passed that we expect the
bouncing signal to have settled into its true state. No matter what
the input is, the only thing that matters is the first transition from
low to high. Within the time range of the monostable multivibrator's
delay before returning to its single stable state (low in this case),
no other inputs matter. Now the question is what kind of circuit
behaves like a monostable multivibrator. And of course there answer is
that there are many. In our case, since we're already married to the
555 timer and it
[definitely oscillates](/posts/clock/#controllable-oscillations), it's
a reasonable choice. Here's a full circuit showing how to make such a
debouncer:

<fig-cite
    title="Monostable multivibrator"
    class="medium padded-white"
    src="/img/clock-extras/monostable-multivibrator.png"
    href="https://www.electronics-tutorials.ws/waveforms/555_timer.html"></fig-cite>

The top right of that image shows the effect. A "trigger" pulse like
the one from a mechanical switch causes the 555 timer to produce a
high signal until that voltage in the capacitor C1 reaches 2/3 of the
source voltage at which point the internal comparator of the 555 timer
turns the output off. Any other inputs in this time range will have no
effect on the 555 timer's output because it is latched to high until
the comparator resets it:

<falstad-circuit src="https://www.falstad.com/circuit/circuitjs.html?ctz=CQAgjCAMB0l3BWECAstIIEwDZsHZNJ8MAOZbZZSZAUwFowwAoMbJQssFFEAZkPDcQPSEwDuIDuDwUwM6RVESpmFNTCYyq6koV65FTAShMAxpOO9sWywJ5h6ZOr2i837j56joIogE768gbgGlDg8LrBjJgWMdEmAErgmiExKJyhOsLUSFkwCEwA8nxWkpBkatRSOkwBGhlxKdphYBHiyQ36mWZ6RnHyVhXeEZgxMHAoAJyTCBPTsxiMvMOQvkwA5nyQPLzbWzsCNcrG8W6y3RJnqSWy8roqJ-J9Jscx-FWWe6Kbz4OxfCQRCYAM4gbA8Zr1SRqFogAAufgArjR2vxodRweiXno-r9rIk+DFmgxDDCeEhWjkwjpoGAEJM6VMULtJphaoSsWjdkDKbouXsufi+W98cE-qIAB4gBgCTTLOiykgUewxABCAHtEQA7Uw0AA6wIAygBLAC2iIANgBDOHG9VapgAI2lYF4k3ADLBy12YyY6pAWgQimErTG6DgMkwkzdKAQvA0uXDkEmMiDmFy4D9kkkQbCakmZETERTbGw6fA2beWcYOeD+bI4zdRHL43gJbT7GzNd4TCAA"></falstad-circuit>

The Theoputer actually uses the exact same values as the circuit
above, with the resistor/capacitor pair across the discharge pin of
the 555 timer being 10K&Omega; and 22uF respectively. Using the
equation from the article linked above, that gives a pulse of width:

$$
\begin{align*}
t_{pulse} &= 1.1 * R * C\\
&= 1.1 * 10^4 * 22 * 10^{-6}\\
&= 242\textrm{ms}
\end{align*}
$$

This felt like a nice compromise between a clean signal and a
responsive stepper.

## Instruction Stepper

With a debouncer in hand we can turn to the task of
integration. Recall that we now have three ways of generating clock
pulses in the Theoputer:

1. A frequency-adjustable square wave generator implemented via a 555 timer
1. An oscillator pegged to a specific frequency (1.8432MHz specifically)
1. A manual pulse generator

Switching between these is fairly straightforward. The Theoputer just
uses some stand SPDT slide switches. We _could_ also debounce these
switches, but it never has been important enough to deal with:

<svg-viewer src="/img/clock/Clock - Rev C.2024-06-12.svg" viewBoxX="37.34544146889748" viewBoxY="-18.091502417450496" viewBoxWidth="179.7391341509268" viewBoxHeight="127.03261132207817">
</svg-viewer>

You'll note there are a couple solder jumpers in there too. Those are
usually in there as some form of insurance. Manufacturing and
assembling boards takes quite a while, so including some post-build
options, especially around parts that you're less certain about, is a
great engineering practice. In this particular case those solder
jumpers are there in case this clock ends up being the "final" clock
that we just want to peg to the computer's maximum frequency.

> Spoiler alert: This was not nor anywhere near the final
  clock. Wishful thinking.

## A Halting Problem

There is a small issue with this instruction stepper and the switches
that is subtle until you try it out. The issue is that often you want
to run a program for a while, stop in the middle, and then start
stepping through instructions. As it is, that would be excruciatingly
difficult. Ideally we want to have a kind of debugging breakpoint
instruction that would pause the computer at a specific point in
execution, switch over to manual stepper mode, and then start stepping
through instructions.

To enable this behaviod we need two things:

1. A control signal that can inhibit/enable the clock signal
1. A way to override the control signal to step over the instruction that set it

Often the best way to proceed in these kinds of scenarios is to start
with the logic statement that you can assert. In order for the clock
signal to be true/high, the clock pulse must be true and either the
halt signal must be false or the override is true. In other
(mathematical) words:

$$
clock = pulse \; \textrm{AND} \; [\textrm{NOT}(halt) \; \textrm{OR} \; override]
$$

We could absolutely implement exactly that logic statement using the
equivalent logic gates, but we have to deal with the real world. In
the real world it's far more convenient to use single types of
gates. Most logic gate ICs come as a set of four gates. So if we used
the one \(\textrm{OR}\) gate from above, we'd be wasting three gates
and a lot of space on our circuit.

There are two *universal* gates out there, which is a fancy way of
saying there are two gates that can be used to create every
gate. Those two are the \(\textrm{NAND}\) gate and the
\(\textrm{NOR}\) gate. For reference, here are the truth tables for
those two gates:

#### NAND Gate Truth Table

| Input A | Input B | Output (A NAND B) |
|---------|---------|-------------------|
| 0       | 0       | 1                 |
| 0       | 1       | 1                 |
| 1       | 0       | 1                 |
| 1       | 1       | 0                 |

#### NOR Gate Truth Table

| Input A | Input B | Output (A NOR B) |
|---------|---------|------------------|
| 0       | 0       | 1                |
| 0       | 1       | 0                |
| 1       | 0       | 0                |
| 1       | 1       | 0                |

Turning back to our needs, let's rewrite the logic statement using
only \(\textrm{NAND}\) gates. We're going to do a couple of operations
and then make observations before continuing, but let's start with
this "simplification":

$$
\begin{align*}
clock &= pulse \; \textrm{AND} \; [\textrm{NOT}(halt) \; \textrm{OR} \; override]\\
&= pulse \; \textrm{AND} \; [(halt \; \textrm{NAND} \; halt) \; \textrm{OR} \; override]\\
&= [pulse \; \textrm{AND} \; (halt \; \textrm{NAND} \; halt)] \; \textrm{OR} \; [pulse \; \textrm{AND} \; override]\\
\end{align*}
$$

To proceed, let's consider how we can implement an \(\textrm{OR}\)
operation as a series of \(\textrm{NAND}\) operations. First, consult
the \(\textrm{NAND}\) table above and note that it's almost an
\(\textrm{OR}\) operation, but the first and last rows are swapped:

#### OR Gate Truth Table

| Input A | Input B | Output (A OR B) |
|---------|---------|-----------------|
| 0       | 0       | 0               |
| 0       | 1       | 1               |
| 1       | 0       | 1               |
| 1       | 1       | 1               |

Notice that if we were to invert the two inputs first, and then
perform a \(\textrm{NAND}\), we would get the \(\textrm{OR}\) result:

| Input A | Input B | NOT A | NOT B | (NOT A) NAND (NOT B) | A OR B |
|---------|---------|-------|-------|----------------------|--------|
| 0       | 0       | 1     | 1     | 0                    | 0      |
| 0       | 1       | 1     | 0     | 1                    | 1      |
| 1       | 0       | 0     | 1     | 1                    | 1      |
| 1       | 1       | 0     | 0     | 1                    | 1      |

Also note that we can perform a \(\textrm{NOT}\) very easily with
\(\textrm{NAND}\):

| Input A | NOT A | A NAND A |
|---------|-------|----------|
| 0       | 1     | 1        |
| 1       | 0     | 0        |

So together that means \(a \; \textrm{OR} \; b = (a \; \textrm{NAND}
\; a) \; \textrm{NAND} \; (b \; \textrm{NAND} \; b)\). Finally, by
definition, an \(\textrm{AND}\) operation is just the inverse of a
\(\textrm{NAND}\) operation (and vice versa), so \(a \; \textrm{AND}
\; b = (a \; \textrm{NAND} \; b) \; \textrm{NAND} \; (a \;
\textrm{NAND} \; b)\). That looks very complicated, but that's really
because we've expanded the \(\textrm{NOT}\)s. If you leave those be,
it's simpler:

$$
\begin{align*}
a \; \textrm{OR} \; b &= \textrm{NOT}(a) \; \textrm{NAND} \; \textrm{NOT}(b)\\
a \; \textrm{AND} \; b &= \textrm{NOT}(a \; \textrm{NAND} \; b)\\
\end{align*}
$$

Turning back to our case, we can simplify things greatly (noting that
we're switching to single letter names to conserve space):

$$
\begin{align*}
clock =\;& [p \; \textrm{AND} \; (h \; \textrm{NAND} \; h)] \; \textrm{OR} \; [p \; \textrm{AND} \; o]\\
=\;& \{\textrm{NOT}[p \; \textrm{NAND} \; (h \; \textrm{NAND} \; h)]\} \; \textrm{OR} \; \{\textrm{NOT}[p \; \textrm{NAND} \; o]\}\\
=\;& \textrm{NOT}\{\textrm{NOT}[p \; \textrm{NAND} \; (h \; \textrm{NAND} \; h)]\} \\
&\textrm{NAND}\\
&\textrm{NOT}\{\textrm{NOT}[p \; \textrm{NAND} \; o]\}\\
\end{align*}
$$

Now for a grand simplification, we can trivially note that \(\textrm{NOT}(\textrm{NOT}(a)) = a\):

$$
\begin{align*}
clock =\;& \textrm{NOT}\{\textrm{NOT}[p \; \textrm{NAND} \; (h \; \textrm{NAND} \; h)]\} \\
&\textrm{NAND}\\
&\textrm{NOT}\{\textrm{NOT}[p \; \textrm{NAND} \; o]\}\\
=\;& [p \; \textrm{NAND} \; (h \; \textrm{NAND} \; h)] \; \textrm{NAND} \; (p \; \textrm{NAND} \; o)
\end{align*}
$$

That looks much nicer! And it happens to be exactly four gates, which
also happens to be the number of gates on a typical logic IC. Clean
livin'. If you got caught in some of that math, or just want some
piece of mind, simulation is your friend:

<falstad-circuit height="300" src="https://www.falstad.com/circuit/circuitjs.html?ctz=CQAgjCAMB0l3BWEAWATLBBOAzM5kxVJsAObbEBSSy6hAUwFowwAoIgdko4DZwe6vcKhIoQABwCuAGwDO9dpC4IhRUSr5ghyEAAsAhtIAui5aoR8NIVKh06A9gDd6AJxcBLACYKwCVCA4-a1sQEmRRGx1qfyQEVgBJEB58a0hRDkgdNSgoaFjWX2oSTE0hTEx-LT5omjjfCGTqUh0ObD5mnP86AoQITEIUME04UWQhztqeiF5R8NDklDma7vqAnlE20RIFzYn8gHduPmzG1NFIVkOrIaKS-moLw7CIkOfwCqhL0LmwD+LND6PAKZM4BILZIFWVAWAJEawwoEcOHQvhI6IpRHIlKBfy2B6sACyIHKlSEYCUpOq1jyXwQeBQCwEowWkPp5D4TJA7M+VzZYSSaS5-IunEo9OQCzpdmw-gczjcXgUoqlQp0KuwQR0BmMpjFOm56pBOikcgUh05HQt6x5Ao21tOuyBp3w1E5LptbrgttVHsF3JxXLaNpmXKCAY1XS+4aD4aCiKDHRDHURQQjYNlMuD1uQmYDOcj5sFEpa2ZZX22+ut-y51qB1d21fdQP6sq9ja9dYWeC2d27Nsbc0bmbrvczLZQw8J4BGg2GJFG42iNKG+uRfqDEK5tRoADNDPJPgAlLlriLz0EQSpe9BIG85GBxUVjY5IhlZV9y1weby65-WFLFv+1BaoYJhPuM2SAZBEgyPIrBAA"></fastad-circuit>

## Finally, A Clock

We can put all of this (and the [Clock Basic]({{<iref "clock.md" >}}))
together to get our final clock circuit:

<svg-viewer src="/img/clock/Clock - Rev C.2024-06-12.svg" viewBoxX="34.0401394526676" viewBoxY="9.959557848510153" viewBoxWidth="223.72415089555705" viewBoxHeight="158.1195060181651">
</svg-viewer>

There are a couple of extra pull-down resistors, on the ~~HLT~~ signal
and the override signal. These are to give a default value of $0$ to
those two signals. There is also an LED to show the clock doing its
clocking, and an inverter built in to this board to produce the
~~^CLK^~~ signal, which is a very useful signal as we'll see when we
go into more of the details around
[the fetch-decode-execute cycle]({{<iref "fetch-decode-execute.md"
>}}). We already know from the [Clock Basics]({{<iref "clock.md" >}})
though that there is a clock down phase and a clock up phase, so that
inverter shouldn't be too surprising.

## Vitamin C

The true electrical engineers out there are probably squirming in
their seats right now. Well, that's assuming any of them are reading
this. But they will be squirming if they are! That is because while
the schematic above is technically fine, it lacks an important feature
that anyone who has built something like this would know is missing:
Vitamin C. Not the kind you get from oranges. Vitamin
capacitance. Namely, bypassing/decoupling capacitors. These are
*paramount* in circuits like this one. They provide a route for high
frequency AC signals in the power rail to reach GND instead of
reaching any component in the circuit.

These bypass capacitors are especially critical in high-frequency
circuits, and while there's no definitive agreement on what
constitutes high frequency, the clock circuit is high enough. In fact,
without the bypass capacitors, this circuit almost doesn't
work. Especially the 555 timers. They require bypass capacitors, but
they also are sensitive enough that the bypass capacitors *must* be
very close to the VCC pins of those ICs.

Unfortunately it wasn't until the third iteration of the Theoputer
clock circuit that this became a large enough issue that it caused a
marathon of oscilloscope work, but at least it happened early enough
to learn the lesson for future boards.

## Closing Thoughts

The clock is such a critical part in the operation of the
Theoputer. It's also one of the few analog parts of the system, which
is not my strength. Even with all of the considerations outline in
this post and the [previous one]({{<iref "clock.md" >}}) there was
still a major issue with the clock, namely that it ended up behvaing
like a [Transmission Line]({{iref "transmission-line-reflections.md"
>}}).

The [most-recent clock circuit]({{<iref "clock-four-layer.md" >}}),
implemented on a four-layer board, is very similar to the one outlined
here, but it includes some nice PCB design features that attempt to
cut down on noise introduced by something called ground bounce.
