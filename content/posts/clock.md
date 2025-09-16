+++
title = 'Clock'
date = 2025-09-15T21:52:12-07:00
draft = true
math = true
+++

## Introduction

Oh the clock. The bane of my digital mind's existence. But maybe the
single most important part of any computer. This thing... has been a
labor of love. As I mentioned in the [Introduction]({{iref
"introduction.md" >}}) I am writing about the Theoputer many months
after having built most of it. The clock was and continues to be one
of the more vexing parts of the machine. That's not because it's
particular complex. It just happens to be the most analog part of the
computer.

I'm a digital guy. I have a really firm grasp of digital logic. It
makes sense to me, because it makes *actual* sense. Analog
circuits... are like an enigma wrapped in a conundrum. At least to my
brain. In this post, I will take you through the several iterations of
the clock, but focus mostly on how it works in its more recent
version: Clock V5.

## Tik Tok Goes the Little Clock

We should start with why this forsaken component is so integral to a
computer. It's likely you've heard about clock speeds and overclocking
and all of that. Modern day clocks are similar to the clock in
Theoputer, but the architectures of modern computers is extremely
complex. That complexity results in less clarity on the connection
between the clock and the speed of the machine.

Fundamentally there are two types of CPUs: scalar and
[superscalar](https://en.wikipedia.org/wiki/Superscalar_processor). Scalar
CPUs execute instructions one at a time, in a sequential
fashion. Superscalar CPUs are super. They're more complex and usually
do fancy pipelining and parallel execution. The Theoputer is a scalar
CPU, and it will almost certainly stay that way. One upside is that
the connection between the clock and the CPU is extremely tight.

The clock is essentially the thing that moves the Theoputer
forward. *Something* has to produce a signal that moves things forward
otherwise nothing will happen. We don't need a clock for this in
theory. A button would work just as well. It would be very slow, but
it would provide a signal that moves things forward. The clock is just
a convenient thing that produces a signal periodically. And they can
be fast! Fast compared to how fast you can press a button at least.

Let's consider a list of instructions that we want the Theoputer to
perform (in plain English for now):

1. Remember the number 4
1. Remember the number 5
1. Add the two numbers you're remembering together
1. Remember the result

The clock is going to gives us the signal it's ok to proceed to the
next instruction. Let's look at a traditional clock signal:

![Square wave clock](img/clock/2x/square-clock@2x.png)
{class="center padded-white"}

We could try to go to the next instruction when the clock goes either
the its maxiumum or its minimum, but that wouldn't actually be a great
idea. We haven't covered it yet, but a computer isn't like a
human... at least not yet. The instructions it executes have to be
stored somewhere and the CPU has to go and get the current instruction
before it can execute the instruction. You might think that's a weird
thing to think about, but the reality is that it will always take
*some* time to perform any kind of operation in any CPU.

It's easy to gloss over the operation "get the current instruction" as
being instaneous, but in the land of computers, *Nothing* (with a
capital *N*) is instantaneous. Everything must be accounted for
because our Theoputer is runnig so fast that even things that seem
like they happen instaneous may not make the deadline. So to execute
any instruction on the list above actually takes two operations:

1. Get the current instruction from the list
1. Execute that instruction

If we were to write this all out, the actual list of instructions for
the Theoputer would be:

1. Get instruction $0$
1. Execute instruction $0$, which in this case says: "Remember the number 4"
1. Get instruction $1$
1. Execute instruction $1$, which in this case says: "Remember the number 5"
1. Get instruction $2$
1. Execute instruction $2$, which in this case says: "Add the two numbers you're remembering together"
1. Get instruction $3$
1. Execute instruction $3$, which in this case says: "Remember the result"

The more pedantic we are, the happy we'll be at this stage. We could
execute each of the list operations above on either the maximum or the
minimum clock point. That would be fine. But we can cheat a
little. Each *transition* of the clock (from min to max, and max to
min) is easily detectable in logic circuits. So, let's just decide
that the "getting of instructions" will happen on the transition from
max to min, and the execution of whatever instruction we got will
happen on the transition from min to max:

![Fetch and execute instructions according to the clock](img/clock/4x/fetch-execute@4x.png)
{class="center padded-white medium"}

We can worry about the details of how this "getting instructions" and
"executing instructions" works in the real Theoputer when we discuss
[the fetch-decode-execute cycle]({{<iref
"fetch-decode-execute.md">}}), but for now our goal is to design a
circuit that can produce that beautiful square wave above.
