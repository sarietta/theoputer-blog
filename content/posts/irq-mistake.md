+++
title = 'Irq Mistake'
date = 2024-10-11T20:05:01-07:00
draft = true
+++

## Introduction

When we covered [Integrating IRQ0]({{< ref "integrating-irq0" >}}) it
may have been obvious that there were a lot of synchronization issues
to deal with. I certainly underestimated how challening that would
be. Going through one of the more subtle issues inspired the post
[Modeling Reality is Hard]({{< ref "modeling-reality-is-hard" >}}).

We'll look at another issue that came up as I was writing the content
for [Integrating IRQ0]({{< ref "integrating-irq0" >}}), which made me
appreciate this process of documentation that I have been rather
loathe to do.

## SR Latches Are Tricky

SR Latches are pretty simple devices, at least on the surface.

![SR Latch Internals](img/irq-mistake/2x/sr-latch-internals@2x.png)
{class="center padded-white"}

There's definitely some complexity here already though, because we
don't often have to consider a self-dependency in circuits. In fact,
that usually is a sign of being too clever, and we should always
Endeavor to Never be Clever™.

Take this part of the original IRQ circuit for an example:

![SR Latch Implementation](img/irq-mistake/2x/sr-latch@2x.png)
{class="center padded white"}

There *is* an issue with this circuit, but it's very hard (for me) to
see. One of the issues is that this circuit breaks the rule of
self-dependence. It's not a real rule in the sense that it cannot be
broken, because this circuit needs to be self-dependent. The circtuit
needs to turn itself off.

The problem is even trickier though. SR Latches are great, but they do
suffer from one critical issue: if both ~~^S^~~ and ~~^R^~~ are active
at the same time, the state of the latch is considered unstable. Well,
that's what any Internet search would have you believe at least. Let's
evaluate the state of the SR latch from above when both inputs are LO
(active in this case). Supposedly this is an unstable configuation:

![SR Latch Unstable](img/irq-mistake/2x/sr-latch-unstable@2x.png)
{class="center padded-white"}

But that doesn't appear unstable at all! Anytime one of the NAND
inputs is LO, the output will be HI. The NAND gates themselves are
*not* in an unstable state. They are very stable!

The issue with this state is twofold:

1. The complimentary output (~~^Q^~~ in this case) is supposed to be
opposite the output, and it is not; they are both HI.

2. If both ~~^S^~~ and ~~^R^~~ change to HI *at the same time*, there
will be ambiguity about the state of the SR latch.

These are the reasons this configuration is called unstable. Being a
bit pedantic, I would argue at this moment in time the configuration
is stable, but *inconsistent* and the *simultaneous transition* to
`S=R=1` is an unstable transition.

In general this means we have to be very careful when using SR latches
to avoid the two cases above. We can certainly use `S=R=0`, but great
care must be taken, and in general it's likely best avoided.

## Timing Diagram for SR Latch

Reconsidering the original IRQ circuit:

![SR Latch Implementation](img/irq-mistake/2x/sr-latch@2x.png)
{class="center padded-white"}

There are two SR latches in this schematic. One is saving the state of
the ~~↑CLK_STAGE~~ signal and the other saves the state of the
~~DO_IRQ~~ signal. In effect, the two latches tell us what stage of
the interrupt request sequence we are in (see
[Integrating IRQ0: IRQ Stages]({{< ref "integrating-irq0#irq-stages"
>}}) for details on that).

Let's consider the timing diagram for the entire interrupt
request. It's fairly complicated, but in putting this together, I
actually discovered the issue this entire post is about. So while it's
laborious (sometimes) to put these diagrams together, they are very
useful for working through the challenging timing interactions of
circuits, especially when there is self-dependence.

![Timing Diagram](img/irq-mistake/2x/timing-diagram-1@2x.png)
{class="center padded-white"}

There is a lot to take in, and it's hard to discuss the parts of this
in written word. The main part we want to look at, for now, is the
interactions between the clock stage signals and the SR latch for the
~~DO_IRQ~~ signal.

![Simplified Timing Diagram](img/irq-mistake/2x/timing-diagram-simple@2x.png)
{class="center padded-white"}

Starting from the bottom we see that there is a distinct
~~↑CLK_STAGE~~ block starting at Ⓐ, following by a ~~↓CLK_STAGE~~
block starting at Ⓑ.

> Note: Because of "hysteresis" in the gates/transistors and
  non-instantaneous transition times, the moment when a signal goes
  from HI to LO, or LO to HI is not a sharp boundary. We're using a
  visualization here that is an approximation for the CMOS voltages,
  that is, LO is below ~0.8V and HI is above ~4V.

This simplified timing diagram doesn't show the resetting signals, but
we don't need them to illustrate the problem here. Take a look at this
region:

![Highlighted Timing Diagram](img/irq-mistake/2x/timing-diagram-overlap@2x.png)
{class="center padded-white"}

Both ~~^S^~~ and ~~^R^~~ are LO in this shaded block! That's exactly
the situation that is unstable, according to everything you'll read
about SR latches. Is this a problem for us? That's not an easy
question to answer quickly. The quick answer, which is worth always
applying, is *probably*. And *probably* means just fix it, because
**the cost of fixing it will almost always be less than the cost to not
fix it**.

For argument sake, let's look at an exaggerated, unlikely but possible
situation going on with the signal delays on the ~~^S^~~ input and the
~~^R^~~ input:

![Exaggerated Overlap](img/irq-mistake/2x/timing-diagram-exaggerated@2x.png)
{class="center padded-white"}

So now we have a problem! If ~~^S^~~ stays active too long, two bad
things can happen. Either ~~^S^~~ and ~~^R^~~ will **race**, and the
winner will set the output ~~DO_IRQ~~. Or ~~^S^~~ is active so long
that it always wins out, and ~~DO_IRQ~~ stays HI after the interrupt
request! That's definitely not correct.

The fix for this is to use a device that doesn't suffer from this kind
of issue, and for that we will use a JK Flip Flop.

> Medium aside: My original fabricated circuit did use an SR Latch in
  the way described above. When I used a TTL-like gate (74HC**T**
  prefix) to invert the ~~CLK~~ signal, everything worked perfectly
  fine. However, when I inadvertently swapped that gate out with a
  CMOS-like gate (74HC prefix) I had this exact issue crop up. My best
  guess is the delay introduced in the CMOS-like gate, due to a higher
  voltage threshold for HI, caused a delay in the resetting
  signals. That delay was great enough in some, but not all,
  circumstances to cause the two inputs to the SR latch to race, as
  ~~^R^~~ was connected to one of those resetting signals.

## Fixing the SR Latch

When an SR Latch just won't do the usual answer is a JK Flip Flop. And
anytime I enjoy my flip flops I like to pair that with a nice Piña
Colada🍹 (or Chi Chi if you want to be a bit more fashion forward), so
treat yourself in kind if you are so bold.

The beauty of the JK Flip Flop is that it is *clocked*, so that it
will only change on a transition from LO to HI or HI to LO, no matter
what else is going on with the input signals.

Let's zoom out mentally from our schematic for the interrupt request
and think about what it means for the ~~DO_IRQ~~ signal to be
active. That signal should really only ever be turned on when the
interrupt request first comes in. After that, the next thing the
~~DO_IRQ~~ signal should do is turn off, namely at the point when
we're resetting our circuit.

In our circuit we _almost_ have the condition we need. The interrupt
request signal itself, ~~IRQ0~~ definitely creates a LO -> HI
transition and then stays HI thereafter.

![IRQ0 Input Circuit](img/irq-mistake/2x/irq0-input-circuit@2x.png)
{class="center padded-white"}

And funny enough that uses a JK Flip Flop! The other part of the
circuit that is faded out is also important. It ensures that we don't
start handling the interrupt request via ~~DO_IRQ~~ until we both
received the signal on ~~IRQ0~~ and we have _just_ processed a
step-like operation. If you're questioning why we need that, reread
[Integrating IRQ0: What's the Next Instruction]({{< ref
"integrating-irq0#whats-the-next-instruction" >}}).

Importantly, while there is only one time that the output of the
~~IRQ0~~ JK Flip Flop goes from LO to HI, the top partof the schematic
actually oscillates in time with the ~~CLK~~ signal, assuming we are
executing a sequence of ==JMP==-like instructions. It so happens that
our interrupt request handling logic does in fact execute a sequence
of those operations, so we can consider the top of this schematic as
reproducing the ~~CLK~~ signal. That's reflected in the timing diagram
if we look closely:

![Simplified Timing Diagram](img/irq-mistake/2x/timing-diagram-simple@2x.png)
{class="center padded-white"}

The ~~DO_IRQ.^S^~~ signal is tied to the output of the right-most NAND
gate and it's clear that signal is oscillating from the diagram.

What that means is we can't _just_ rely on this one signal to be the
input to the JK Flip Flop we will be adding in place of the old SR
Latch.

The _real_ condition we want to clock on is when both:

1. There is a transition from LO to HI of the circuit above (i.e. the circuit that gives LO to HI transitions, with an 's', when there was an ~~IRQ0~~ pulse and a ==JMP==-like instruction was just executed)
2. We aren't already in the ~~DO_IRQ~~ phase of interrupt processing

We could achieve that with some gates, but the JK isn't just kidding!
We can actually use its inputs a bit more intelligently and do this
directly:

![Improved DO_IRQ](img/irq-mistake/2x/improved-do-irq@2x.png)
{class="center padded-white"}

Just as advertised, we are using that ~~JMP~~-like + ~~IRQ0~~ signal
as the clock pulse. But notice that the other inputs to the JK Flip
Flop are being driven by the complimentary output of that same JK!
Talk about self-dependence...

In this case we want this connection. Let's think about what's
happening here. We can satisfy condition (1) above from the signal at
the JK's clock input. Condition (2) states that we need to detect
whether we're already in a ~~DO_IRQ~~ stage, and if so, ignore the
clock. Let's look at the truth table for this JK Flip Flop, and pay
careful attention to note that the ~~^K^~~ input is *inverted*:

| ^S^ | ^R^ | CLK | J | ^K^ | Q         | ^Q^       |
|-----|-----|-----|---|-----|-----------|-----------|
| 0   | 1   | X   | X | X   | 1         | 0         |
| 1   | 0   | X   | X | X   | 0         | 1         |
| 0   | 0   | X   | X | X   | 1*        | 1*        |
| 1   | 1   | ↑   | 0 | 0   | 0         | 1         |
| 1   | 1   | ↑   | 1 | 0   | Toggle    | Toggle    |
| 1   | 1   | ↑   | 0 | 1   | No Change | No Change |
| 1   | 1   | ↑   | 1 | 1   | 1         | 0         |
| 1   | 1   | 0   | X | X   | No Change | No Change |
