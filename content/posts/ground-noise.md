+++
title = "Ground Noise"
description = "Printed circuit boards are amazing but introduce all sorts of complexities that don't exist in schematics. Here we look at some of the more important issues that PCBs encounter around noise in the power rails."
date = 2025-09-27T14:11:44-07:00
draft = false
math = true
categories = ['Debugging', 'Electrical Engineering']
image = 'img/ground-noise/header.png'
+++

## Introduction

When I originally started writing about the
[4-Layer Clock Board]({{<iref "clock-four-layer.md">}}) I thought I
could just briefly describe why I wanted to switch to four
layers. That was a foolish thought that should have been obvious
because I linked a
[video about *just* the stackup of a four layer board]((https://www.youtube.com/watch?v=kdCJxdR7L_I))
that's an hour long.

In simple terms the reason I moved to four layers for the clock board,
and would prefer to move to four layers for all boards were it not so
expensive, is that four layer boards provide a much better way to
reduce ground noise. Ground noise sounds innocuous, but it can be so
strong that gates can flip and timings can be affected. So in this
post I am diving deep into all of the considerations around ground
noise that lead to rules I went over in the
[4-Layer Clock Board]({{<iref "clock-four-layer.md">}}) post.

## Ground Bounce

Ground bounce feels like a foreign and extremely specific phenomenon,
but it is absolutely in the realm of "normal engineering" when there
are fast switching semiconductors around. There's no definitive rule
to what "fast switching" means, but it's important to note that this
switching time is *not* related to the clocking frequency of the
Theoputer. Rather, it refers to how quickly the voltage transitions
occur within the semiconductor itself. The semiconductors used in the
Theoputer (see [Chip Type Primer]({{<iref "chip-types.md" >}}) for
more info) are plenty fast to cause issues with ground bounce.

Fundamentally, ground bounce is a phenomenon that happens because
*everything* is an inductor on some level. Just like everything is a
capacitor, and also a resistor! Oh and that also means everything
produces oscillations <grimace>. While that's scary, in this case it's
the inductance that matters most... for now.

Inductors are one of the fundamental passive components. Unlike
resistors, which have a linear relationship between current flowing
through them and the voltage drop they impose via \(V = I * R\),
inductors (like capacitors) have a more complex *differential*
relationship between the current flowing through them and the voltage
they induce:

$$
V(t) = L\frac{di}{dt}
$$

What you'll note about that is when there is a spike of current, there
is a spike of voltage. If you recall that voltage in a circuit is
actually the *difference* between the "high" voltage point (usually
VCC, or 5V in the Theoputer) and the "low" voltage point (nominally
0V) you may start to see the problem. If there is a large current
spike through an inductor, there will be a large voltage spike. That
large voltage spike will affect the effective ground level in the
circuit, the definition of low and high will change. And that's
potentially an issue because other semiconductors that use the same
ground path may react incorrectly according to this false or
"bouncing" ground level.

The two sources of large inductance we'll look at are:

1. Inductance in the GND return path
1. Inductance in the VDD supply line

## Inductance in Current Return Path

Whenever there is current flow there must be a path from a high
potential to a low potential. Typically the component that drives the
current flow for an entire circuit is the power source. Its job is to
separate the positive charge (confusingly for physicists the
electrons) and the negative charges so that the positive charges will
flow through the circuit to meet the negative charges. The source of
the positive charges is called VCC (or VDD) and the sink for those
positive charges is called GND.

It's easy to forget that this must always be the case. But try not to
forget! The current in any part of a circuit must always return to
GND. This path is called the current return path. Let's consider what
happens if there is a lot of inductance along this path. Recall that
an inductor, or anything that exhibits having inductance, will induce
a voltage according to Faraday's Law for Inductors (maybe it's Henry's
Law too?):

$$
V(t) = L\frac{di}{dt}
$$

Thus if there is a large inductance along the return current path,
that will induce a voltage, which will cause the apparent voltage of
GND to actually be different than true GND! This is the bouncing and
the ground bouncing. Hence the name. Let's see what this can do in a
circuit that relies on a stable GND of 0V:

<falstad-circuit src="https://www.falstad.com/circuit/circuitjs.html?ctz=CQAgDCCMCmC0Ac4B08wGZKQJwBYtYDYwCB2AJgFYsQKIKa65MAoAMxEJAJyiK58hQk9MEjBk2HArwiQ+ciLOHJxzAO4yQqTZjLh1OyHoVQcPMAc7cpUI-o2ddNkxYCyINGmlPP06xDJhZgAlTRxEF3AonDooxSCAcxA8aTJyZM40MHN9UJTkxHy5OOTYxWQKZncqYzsa-ijAyo0cNFq9VuM+Cxa2hs7bPR6M7zsis3sRrQgiuwt2AZMi7qERMQkFvut860FIZVFVUL6nWGKnAKgwa5uQJruDioMTu0c5g0W7NHgBd40TSAkbx8MhgRDDEygxDfHhQ-QAGymcPyaSGKhu2VoFDw+FxeKw9FghzAkHgaXEchwoNaYJIkxhdzBSKZwyKQOZ4OYAGMPF5BrzgTMaExBDgkLigVicNiySQ1tdBBYkr5NCrAdJFAYAV8+RdmEl6iZDezNTzDXUsF0hRQRSAzkhIDhsGRIN9QZbsiQ0OjFQZzR03kNmAAZDw-fkM-xQECsACG8IAztAaPoAB40OlnKBoOkdKB6ADCrgA8gBlAA6CYAkgA7ABu0AATgAXJvMABGyUzZG9oNzZHMHeSmDtZEQFB7UHgdIs6apEDOPFoC5HAkLJYr1frTdbjaHLsKPC8xgJabuZGoBG9bW98FF+ZAxYArs2AA4v8vlmsACgLsdfsZcgAls2QENpWwYAPaxgAJgAlEOFDpJ4IAkMUoKaumRB0vA3oEFgt7SGuIAAOLwiBXIABZATWCSVs+b4vsw6bYrm0qoRgdzhMkD6lkBAC2T7wrGrYwZWwTQM2T6NjWEGQZBr6VrWMFPlyzaxjWXLQEOOAkP2ggkHgdzdMwkFcNGshkBedDCGQBAENOWC4VkMqKmICqNFc+jfOeIAAGKKlAcDgu5Nz4uF+J2oIymqepmnaUAA"></falstad-circuit>

Here we can see the problem. The CMOS chip on the bottom right will
switch on if the gate-source junction voltage reaches a threshold. But
in this circuit the source voltage is bouncing due to the inductance
(\(L\)) in the return current path and the rapidly switching inverter
\(\frac{di}{dt}\) on the left.

### Mitigating Ground Bounce

The easiest way to get rid of the inductance between a chip's GND pin
and the actual return current path is to lower the inductance of the
return path. The way to do this is to make a nice big and continuous
ground plane! The larger a trace is the lower its inductance will
be. With a ground plane that is the entire size of the board, you've
got about as big of a "trace" as you can have. And with that will be a
lower inductance.

In addition, and this is very subtle, adding stitching vias to the
ground plane if the IC GND pin is not directly connected to the ground
plance, is also very helpful. The vias will add some inductance, but
the ground plane is effectively already sitting at 0V given it has
almost no indutance in it, and that means the "faster" the current can
get to the ground plane the lower the overall inductance of the return
path will be. Moreover, inductors in parallel exhibit *less*
inductance than their individual sums:

$$
\frac{1}{L_{total}} = \frac{1}{L_i} + \frac{1}{L_2} + ... + \frac{1}{L_N}
$$

So adding multiple stitching vias actually reduces the overall
inductance!

## Inductance in VDD Lines

We know that high inductance is going to cause "ground bounce", but
really any fluctuation of *either* the high voltage side of a circuit
or the low voltage side will cause an issue. Just like we argued about
ground bouncing earlier, we can have a similar problem with this
supply side.

If there is inductance between the supply and the IC in question, the
same formula applies:

$$
V(t) = L\frac{di}{dt}
$$

Inductance between the supply and ICs is actually incredibly
common. Most power supplies are nowhere near the ICs they power. This
is certainly true in the Theoputer, which is about 16cm across. Since
inductance is proportional to trace length, and inversely proportional
to trace width, there's a lot of potential for inductance (\(L\)) and
thus a lot of potential for bouncing of the supply voltage. To
illustrate this effect, consider this circuit:

<falstad-circuit src="https://www.falstad.com/circuit/circuitjs.html?ctz=CQAgDCCMCmC0AcUB0BWAbAFgExoMyXngwPkgHYsQUIUqa5JIAoAMxAE40RMo0IfIyWmCRgsrDl0h9eEaRDmpwo8QHdZIeHJmNKYJuvlRIlI5AwZwByd0udje6-d02j+gLIhcuKSa8-bcBAsVCYAJS8wS1gTRFwokBiZBRAMGiCFUIBzVPssMEQMPLSMpk8UdlM-CsoeCBCUawxcKspm02SmlsD2hyt1It825wt+3K4tcb79Nl6jQY1FYRUJXp4FgSFlMXCvVsTpaeCoMFOz4KUGjND1bpdnP30Bu79cImnrMzIpGXzEJ40fy87yBALeliBGB4oKazm+UxhAGN-EMURpLCgGIIMKh4GROCRIFFILgUBhlqdBPoct4fhBaVB4QpPjpXgEXNSqJUNDVGVxmcjeS4hTIMVjUrj8WgCOwMEQcOwyNswFTrEK-AsOUwADLAywucGBFIsACGABsAM7QKhWAAeVCVMSguCVbSglAAwu4APIAZQAOhaAJIAOwAbtAAE4AFyjTAARqlHVhcMEwK6sJZ9InsMnECgU1A8XbUqTEuwqJBaLAuPrPT6A8Hw1HY5GE8ECKlLD5TOxhEx7VgsBW8HtU6RUu6QN6AK7RgAOc-9-pDAAoPSb5ybEQBLaM7iOB7UAexNABMAJTtlAUfwgMiHfLM+18JXwVNodjj2tTgDiZr3REAAsdxDLJA1nBc5wHLxpUSeBaGoat4DdPxfR3ABbGczRNWMz0DAA1AARIjA1DM8Z0RaMTRDRFoHbYdBBiMAK3QVNYDIZkBmhAoEV4-QzUiaI5SEg4sH+ZVTifFitDOOTTlTERTgLLAyBvah4mlb4sHQMZ5kQIxugBQzKEzelHFuBJugWIzYS4az7BEsEElgbp4m7CzghKNyrMcZFSUoVy2lORJrKgOBCiQL9IFlKFMBdeA0CVJSVSsHI0ggILUhClJ9AtUSsoC0K9CgEBTUtejLOiHzhP+GC0kCqFKy4WBmknPwiOgRFjxnecALAwMNy3Xdo2PNtj24Uq5CHdgIDIVAUBijAyESt58GWisUtS+oOCsN5UkEAAxKlwoQZUmMEcjKOo2j6KAA"></falstad-circuit>

These values are not common nor anywhere close to what you would
measure empirically in a circuit, but they are demonstrative of the
problem. As the IC draws current to perform the invert operation there
is a spike in current causing a large value of \(\frac{di}{dt}\). In
the circuit above there is inductance between the VDD and the CMOS
source pins which causes the voltage at the source pin to bounce. This
in turn can erroneously trigger the other CMOS semiconductor. In
effect, the semiconductor on the right *thinks* that the gate-source
junction voltage is higher/lower than it actually is.

### Mitigating VDD Bounce

There are two main ways that the Theoputer design mitigates this
bouncing of VDD:

1. Thicker VDD traces
1. Decoupling capacitors

As noted above, thicker traces have a lower inductance, so you can
simply lower the overall inductance of those long power supply traces
by making them thicker. In the Theoputer the VDD and GND lines have a
trace width of 0.3mm whereas the signal lines have a width of 0.2mm.

The second, and far more important, solution to VDD bounce is via the
use of decoupling capacitors. Take the simulation circuit above and
note what happens when you click the switch to activate the decoupling
capacitor:

<falstad-circuit src="https://www.falstad.com/circuit/circuitjs.html?ctz=CQAgDCCMCmC0AcUB0BWAbAFgExoMyXngwPkgHYsQUIUqa5JIAoAMxAE40RMo0IfIyWmCRgsrDl0h9eEaRDmpwo8QHdZIeHJmNKYJuvlRIlI5AwZwByd0udje6-d02j+gLIhcuKSa8-bcBAsVCYAJS8wS1gTRFwokBiZBRAMGiCFUIBzVPssMEQMPLSMpk8UdlM-CsoeCBCUawxcKspm02SmlsD2hyt1It825wt+3K4tcb79Nl6jQY1FYRUJXp4FgSFlMXCvVsTpaeCoMFOz4KUGjND1bpdnP30Bu79cImnrMzIpGXzEJ40fy87yBALeliBGB4oKazm+UxhAGN-EMURpLCgGIIMKh4GROCRIFFILgUBhlqdBPoct4fhBaVB4QpPjpXgEXNSqJUNDVGVxmcjeS4hTIMVjUrj8WgCOwMEQcOwyNswFTrEK-AsOUwADLAywucGBFIsACGABsAM7QKhWAAeVCVMSguCVbSglAAwu4APIAZQAOhaAJIAOwAbtAAE4AFyjTAARqlHVhcMEwK6sJZ9InsMnECgU1A8XbUqTEuwqJBaLAuPrPT6A8Hw1HY5GE8ECKlLD5TOxhEx7VgsBW8HtU6RUu6QN6AK7RgAOc-9-pDAAoPSb5ybEQBLaM7iOB7UAexNABMAJTtlAUfwgMiHfLM+18JXwVNodjj2tTgDiZr3REAAsdxDLJA1nBc5wHLxpUSeBaGoat4DdPxfR3ABbGczRNWMz0DAA1AARIjA1DM8Z0RaMTRDRFoHbYdBBiMAK3QVNYDIZkBmhAoEV4-QzUiaI5SEg4sH+ZVTifFitDOOTTlTERTgLLAyBvah4mlb4sHQMZ5kQIxugBQzKEzelHFuBJugWIzYS4az7BEsEElgbp4m7CzghKNyrMcZFSUoVy2lORJrKgOBCiQL9IFlKFMBdeA0CVJSVSsHI0ggILUhClJ9AtUSsoC0K9CgEBTUtejLOiHzhP+GC0kCqFKy4WBmknPwiOgRFjxnecALAwMNy3Xdo2PNtj24Uq5CHdgIDIVAUBijAyESt58GWisUtS+oOCsN5UkEAAxKlwoQZUmMEcjKOo2j6KAA"></falstad-circuit>

Now the two CMOS gates don't need to draw their current at the high
voltage value from the VDD supply. Once the capacitor is charged, it
can supply the current directly. And since the capacitor can be placed
right next to the chips, there is far less inductance along the
way. This is the magic of decoupling capacitors at work!

## Bonus Content

The VDD and GND bouncing is where the bulk of the "ground noise"
observed in the Theoputer (at least for now). But there are two other
topics related to noise in circuits that are worth discussing.

1. Current spikes
1. Loops from high inductance

### Current Spikes

Let's go back to the equation for voltage induced by inductors:

$$
V(t) = L\frac{di}{dt}
$$

We talked about how having a low \(L\) is important to mitigating
ground bounce and mitigating radiative EM signals from ground
loops. But the astute read may wonder why not just try to reduce the
\(\frac{di}{dt}\) term also? Well yes. That's a good idea. However,
there's a cost with this side of the equation. Fundamentally we do
have and want fast switching signals.

> Note: Again it's important to note that we're not talking about the
  frequency of the *clock* here, but rather the rate at which the
  semiconductors switch from the their low/high states. That switching
  time clearly sets limits on how fast our clock can run, but even
  with a slow clock and fast-switching semiconductors all of the
  problems discussed here exist.

But we can decrease this \(\frac{di}{dt}\) term if need be. Typically
we would do this by introducing a resistor at the signal's output
location. Resistance will cause the switching rate to decrease and
thus will decrease the rate of the current's change. In fact, when we
looked at the [Transmission Line]({{< iref
"transmission-line-reflections.md" >}}) issues in the Theoputer we had
to use this exact solution albeit for the slightly different issue of
ringing.

#### Deep Dive on Resistance and Switching Time

Initially the statement that higher resistance increases the rise/fall
time of a signal might make sense, and then it may stop making
sense. Resistance sounds like it would cause things to lag
linguistically, but there's no direct connection between resistance
and rise/fall times of voltages/currents. In order to really
understand this relationship between resistance and rise/fall times we
have to consider a slightly more complex real-world scenario (oh howdy
engineering!).

All parts of a circuit will have capacitances, just like all parts of
a circuit have resistance and inductance. In fact, for most
semiconductor ICs, the capacitance at the signal inputs is often
specified in the datasheets because it is an important and non-trivial
value. There's capacitance in the traces connecting the signaling
paths as well, which can also be important if it's high enough or the
circuit is especially sensitive to capacitance. Either way, the signal
itself will be passing through an RC circuit at this point!

RC circuits are one of those circuits you study in electrical
engineering 101. The aspect of them that's relevant here to rise/fall
times is the equation relating voltage applied to the "input"
(\(V_i\)) and the voltage that is induced across the "capacitor"
(\(V_c\)). Here, input refers to the signal input on an IC and the
capacitor is really the capacitance of the gate at the input and
*maybe* the capacitance of the trace. That relationship looks like
this:

$$
V_c(t) = V_i (1 - e^{-\frac{t}{RC}})
$$

What you'll notice is that a larger \(R\) will result in smaller
derivative:

$$
V'_c(t) = \frac{V_i}{RC} e^{-\frac{t}{RC}}
$$

The maximum value of this derivative occurs at \(t=0\) and is
monotonically decreasing from then on as \(t\) increases. So if you
just look at the constant term \(\frac{V_i}{RC}\) and consider what
happens as \(R\) increases you can see that the derivative will be
small. In other words, a higher resistance will cause the capacitor to
charge slower, decreasing the rise/fall time.

### Large Current Loops

There's another issue with high inductance that is more
subtle. Normally we don't differentiate between impedance and
resistance. That's because for low-frequency DC-like signals,
resistance is the same as impedance. But for high-frequency signals
inductance becomes the more prominent term in the impedance equation:

$$
\begin{align*}
Z_{resistor} &= R\\
Z_{inductor} &= j\omega L\\
Z_{capacitor} &= \frac{1}{j\omega C}\\
\textrm{where} \; \; \omega &= 2\pi f\\
\end{align*}
$$

Since signals will take the lowest impedance path to ground, if the
inductance is high near the closest ground paths, they won't be taken!
That will cause larger loops of current to form as the signal return
current goes through the longer loop. Large loops can start to look
like antennas or electromagnets or all sorts of oscillating
badness.

## Final Thoughts

Noise in power lines (not really just ground) causes a lot of
non-trivial problems as I've hopefully outlined well above. On more
than one occasion one of the problems above caused *me* issues that
cost me weeks of debugging.

It's easy to disregard noise as, well as just noise. "It's not
important" because it's just noise. But that's not great engineering
practice. It's almost always in the edge cases, where the noise likes
to live, that affect the operation of systems. In practicing good
engineering habits I could have been more attentive to these sources
of noise, but I wasn't. I also didn't really know about them before
this project though, so I'll give myself a little slack.

If you're curious about the practical implications of ground noise,
read up on moving the clock to a [4-layer PCB]({{<iref
"clock-four-layer.md" >}}).
