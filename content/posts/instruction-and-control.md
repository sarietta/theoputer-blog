+++
title = 'Instruction and Control'
date = 2025-10-14T21:19:08-07:00
draft = true
categories = ['Sub Systems', 'Computer Engineering', 'Electrical Engineering']
tags = ['Instruction and Control', 'Instruction Set']
+++

## Introduction

The way I was taught about how computers work was via the "fetch,
decode, execute" loop. I have no idea if this is standard pedagogy,
but I imagine it is. The idea is that any computer must have a process
to figure out the next operation to perform (fetch), it needs to be
able to turn that operation into the correct set of control signals
(decode), and of course once all of those control signals are setup it
needs to actually perform the operation (execute).

I'm sure there are computers out there that think of these three steps
as independent, and it's probably the case that most are like that,
but in the Theoputer I decided to simplify things a bit. Instead of
three steps, I decided to combine the (fetch and decode) steps into a
single step.

The reason for this is really about the clock! The clock has two
distinct phases: the down phase and the up phase. Trying to split
things into threes or spending three clock cycles for each instruction
just seemed like a waste.

The circuit responsible for this combined fetch + decode stage I have
dubbed the Instruction and Control board. Its job is to fetch
instructions and decode those instructions into the set of control
signals.

I should note that this is one of the more complex and complicated
parts of the Theoputer. Apart from the [Daughter Board]({{< iref
"daughter-board.md" >}}) it's also the largest. This post will be
about the current board, which doesn't suffer from the many issues
that the prior boards plagued me with, but I will try to walk through
some of the stickier parts along the way.

## Two Clock Phases, One Set of Lines

Recall that when we designed our clock we made a point about how there
are two phases:

![Fetch and decode phases of the clock](/img/clock/4x/realistic-clock-cycle@4x.png)
{class="padded-white center medium"}

The Instruction and Control (I&C) circuit is *only* responsible for
that first phase, labeled the "fetch" phase. The I&C board is also the
*only* circuit that is allowed to operate in this fetch phase because
it is uniquely responsible for setting the control signals in the
Theoputer. We discussed this a bit in the overview of
[how the Theoputer computes]({{< iref
"overview.md#how-does-it-compute" >}}), but let's do a slightly deeper
dive.

Let's avoid looking at the schematic for now; it's a bit complicated
for our purposes. Instead, consider the following blocks:

![Instruction and control, decoder, and register blocks](/img/instruction-and-control/4x/simplified-parts@4x.png)
{class="padded-white center medium"}

We see the I&C board here, which takes an instruction address, fetches
that instruction, and decodes it into a set of control lines. In this
simplified case we're looking at just two of those control signals, a
read and a write signal for one of the [registers]({{< iref
"register.md" >}}). You'll also note that the register is connected to
the [databus]({{< iref "databus.md" >}}) and that connection is
two-way. The register both can read and write to the databus depending
on which control signal is active.

Let's look at a specific instruction that will load the value \(1\)
into register A. In [Theoputer Assembly]({{< iref "assembly.md" >}})
