+++
title = 'Databus'
description = 'The databus is like the central nercous system of the computer. Every interaction between the systems in the Theoputer use the same 16 signals, but how do we do that safely is the real question.'
date = 2025-10-07T15:50:01-07:00
draft = false
categories = ['Sub Systems', 'Computer Engineering', 'Electrical Engineering']
+++

## Introduction

The databus in the Theoputer is like the nerves in your body. It
connects the various cognitive parts of you (e.g. your brain) to the
functional parts of you (e.g. your arm) via physical connections
(nerves) that carry signals (also electrical!).

The Theoputer databus is 16bits wide, meaning it can carry 16 1bit
(low/off/0 or high/on/1) numbers in parallel at once. Originally I had
thought that 8bits "would be enough", because after all this is an
8bit computer! But I think the minimum for an Nbit computer is to have
a databus that's 2Nbits wide, unless you want operations to always
take extra clock cycles and bother with adding additional registers to
store each Nbit number before operating on them.

As far as *what* the databus actually is, well it's not like the other
systems in the Theoputer. It really is nothing more than 16 copper
traces that go all around the board connecting the various other
systems together. I'm also including the buffers (see below) in the
conversation though, because I think it's important to understand how
those other systems can use the same 16 lines in a safe way.

## A Motivating Thought

You might wonder why we need a bus at all. Why not just connect up all
of the components to each other? While that's easy enough to do in
KiCad, the physical implications of that are stifling.

As a quick example, imagine you wanted to copy the contents of
[Register]({{< iref "register.md" >}}) A to Register B. We could have
dedicated lines connecting A and B easily enough, but what if we
wanted to instead copy Register X to Register B? Now we have a
problem. We either need *another* set of lines (eight in this case
since the registers are 8bit) and we need a way to tell Register B to
take the data from the lines coming from Register X and ignore
anything on the lines coming from Register A. You can see that this
quickly becomes incredibly complex as you add more things that need to
read/write from/to each other.

Instead we have this single databus that everything uses to
communicate to everything else. However, care must be taken to ensure
we don't contend for those same lines.

## Contentious Behavior

Imagine you're driving down a single-lane road and a car pulls onto
that road as you're whizzing by. In the best case you're probably
going to be angry that someone would do that. At worst you may find
yourself in a crash.

The databus is similar. It only can handle one signal at a time per
data line. If two things attempt to write to the same data line at the
same time there will be something called **bus contention**. This is
akin to cars crashing but with voltage.

Let's do some good electrical engineering here and look at the cases:

<falstad-circuit
    autorun="true"
    src="http://localhost:1313/js/circuitjs/circuitjs.html?ctz=CQAgjCAMB0l3BWcMBMcUHYMGZIA4UA2ATmIxAUgoqoQFMBaMMAKAEkKNCQUAWKwgm58qo6EgTtO3bGhCCZcsRKkKe-EBjkioUcRVVCQsqlqondMFQBlp62ijz3LIAGYBDADYBnOtUgstghcxnIIjqGiuh4+fkgBHHiyPFogxGAoKZnKBgBOIEmZmJmFxoROVGDwLADmBcnY5fWZ-FEB+WbOpcW6VXAsHXIW3amV1RzpRamkU9l6KgCyacSzyBo9VCjiLEszILzE3FUaB9yb2xMZ+4fLLTc5koO0vLzN12fI-U-7hK+lp71qnVSggVm9CHxLAM3gCQWCxv1EskAZN3pZ9JIgiEEC8KBEca9Km4vL5-IE7LxfninJTCeBibEyRw1ATNGFcQ9DNxaWyqDzORxgtxWSyOfMDIKQjy1PzxZJJdxCKk1Eq5lYJXYMOF5EYtWqMVz5KlOqr0SpmbrtZ09WaDFjFalwk5TUSYqT4uShZptU7vWqGe6oFJShhIK9UaG6erHm9I288HBAf1gckE1RSqVRNCTakQ2Gk+1eX7Y-mEQk0lc43s45zdmC48dTKWeNsAB48TApPkRXB89QgABCAFdvAAdbwAYQA9gA7AAudHnAEtZ6PRzOABQAFQA7lPx9YpzvxwB5IdzgAO5+8AEoWO2UGAaWR9pDwuRXpDh2PJ7OF8vV3Xbc93HAAJJcagAC1Pc8rznW973AYhnRuShMi0bl+2-cdp3nRc5xXGc103E8ZzoA8jwAGlPMiwIg6DvDPS9zzvIA"></falstad-circuit>

> Note: The resistors are needed to create a mathematically solvable
  circuit, yet another fishy smell that something is amiss with this
  setup.

Technically the top two cases are "fine". Two low outputs on the
databus will effectively create two ground points, which is
fine. Likewise two high outputs will provide two sources of VCC, which
is also fine. But the bottom case is a problem. One of the outputs is
driving the bus line high while the other is in the low state, which
will look like a ground. This will leave the bus line in an
indeterminate state. What should the databus value be in this case? Is
it high or low? It can't be both! This isn't a quantum computer
unfortunately.

Even the top two cases are problematic, because due to potential race
conditions and different resistances, etc. the outputs could look like
a high and low value.

In summation, you never want to have the possibility for bus
contention and thus you always want to use a component that sits
between any output and the databus that can be put into a state such
that it appears the output is completely disconnected from the
bus. For this, the tristate buffer will enter the chat.

## Tristate Buffers

Tristate buffers are buffers that have three states. A buffer is a
component that will take an input signal and produce an output signal
that's exactly the same as the input but with the ability to
source/provide a lot of current (unless the output is a high current
output but that's not too common).

The tristateness of the tristate buffer refers to the fact that the
buffer can either produce a low, high, or high impedence/short
circuit/disconnected output. This is perfect for handling bus
contention. We can just stick a tristate buffer between the outputs
and the bus:

<falstad-circuit
    autorun="true"
    src="http://localhost:1313/js/circuitjs/circuitjs.html?ctz=CQAgjCAMB0l3BWcMBMcUHYMGZIA4UA2ATmIxAUgoqoQFMBaMMAKABkKwUQAWbbnoR69+UcCABmAQwA2AZzrVI7TtwRdeQ1WKrT5ipMoCSIQhgF4qGBBap3oSBCwBOp870tu1GQmLDwWAHMvCh8QwnwdFhNrWxA8UR5Pe0cWAFl4xM88TyS7EBQHFjBPdQFRCLwRbggYCH94RrhkJuanEtoNMtNI7troetbGltaKFQQI3mJfCapBYXy9BSVxyZ4wGcnsPAXxJYMoFgB3Hqq+bjM45RPK7UuPOxYgA">
</falstad-circuit>

With the top tristate buffer enabled and the bottom disabled we are
fine because the bottom output will appear effectively disconnected
from the bus line altogether.

## One Bus to Rule Them All

You'll note that we didn't talk about multiple inputs and the need for
buffers between the databus and inputs. Strictly speaking we don't
*need* buffers between the databus and our various inputs (most of
which are registers). A single output can easily drive multiple
inputs. But we don't have to worry about that in most cases because
the inputs for logic gates are almost always relatively very high
impedence and thus draw very little current.

Thus, together with the output buffers, a standard interface to the
databus looks like this:

<svg-viewer
    viewBoxX="47.76851919535497" viewBoxY="6.730544840427797" viewBoxWidth="191.6409522936328" viewBoxHeight="135.55365892441128"
    src="/img/databus/Daughter Assembly.V8-20250912-RegA.svg">
</svg-viewer>

The very keen observer will note that there is a signal on the
SN74LV374A labeled ~~^OE^~~ and this actually controls a built-in
tristate output buffer in this register! Including such an input
signal is fairly common with components that are likely to be
connected to a bus, like a register.

In the Theoputer we still add in a tristate buffer though so that we
can visualize the contents of the register via the diagnostic LEDs. In
theory we could remove the LEDs and the buffer, but the value in
having the ability to debug the register contents outweighs the space
gain.

## Reset Me

There is one other function of the databus in the
Theoputer. Originally there was a set of DIP switches that defined a
reset address and the value implied by the DIP switches would be put
on to the databus when the ~~RST~~ signal was high.

However there really was never a good reason to change the default
reset address of 0 to anything else. The computer has to start
executing from some address, and it might as well be 0, so 0 it's been
since day one.

That means the DIP switches aren't needed anymore. Instead we use the
fact that everything that outputs to the databus does so through a
tristate buffer. If nothing is outputing to the databus then the value
on those lines will be... well what? Inherently it will be noise, but
we can easily add 16 pull-down resistors to the databus simultaneously
avoding grounding out the databus lines and providing a nice default
value when no other value is present on the lines:

<svg-viewer
    viewBoxX="430.05551477730575" viewBoxY="12.376832445427336" viewBoxWidth="107.60901122859507" viewBoxHeight="76.11523022972766"
    src="/img/daughter-board/Daughter Assembly.V8-20250912.svg">
</svg-viewer>

Look there's even a note explaining this! (pats self on back). If
there are no control signals set apart from the ~~PI~~ signal (set the
program counter from the databus) then the program counter will load
the value 0 on the next ~~CLK~~ transition from low to high,
effectively resetting the computer.

## Final Thoughts

For something as simple as "just 16 signals", the databus is
critically important to the operation of the Theoputer. You might
wonder why we don't add in *more* protection to the bus. We could
certainly add in detection logic so that a fault would occur (and be
prevented) if two things attempted to write to the bus at the
same. The choice to avoid that extra hardware is one of those classic
engineering choices. It's just simply too costly in space and money to
do. There aren't many (maybe just one) people using the Theoputer and
thus it's just not that likely to occur.

You might also gasp if you looked at the routing of the databus
lines. They are not easy to follow, because they go *everywhere* but
you can try:

<kicanvas-embed
    initialZoom="47.73505099647667" initialX="96.22279802767221" initialY="72.55622887886705"
    src="/pcb/Daughter Assembly.V8-20250912.kicad_pcb"
    layers="Edge.Cuts, F.Fab, F.SilkS, Holes, Vias, F.Cu, B.Cu, Pads, F.Silkscreen"
    controls="basic+"></kicanvas-embed>

The gasping may continue if you also read and became an evangalest of
the [ground noise]({{< iref "ground-noise.md" >}}) post. Again, the
engineering excuse will save us all in the end.
