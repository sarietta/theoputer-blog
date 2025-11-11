+++
title = 'C Compiler Intro'
date = 2025-10-17T17:19:17-07:00
draft = true
categories = ['Computer Science']
tags = ['Compiler']
+++

## Introduction

This will be an adventure to document. I wrote the C compiler over the
course of a couple of months in 2024. It was a fast-paced situation,
and I wasn't thinking about documenting my work. I do, however, have a
tendency to comment my personal code quite a lot. It's a force of
habit.

So now I will try to piece things together, but be forewarned that
there were a lot of things that I had to figure out that I wrote down
on paper. With a pencil! And those pieces of paper are lost. And I
probably forgot some of it too.

This will be the first post of several as I try to piece together the
3600 lines of code that comprise the compiler for my
[C(ish) language]({{< iref "cish.md" >}}). Wish me luck.

## The Parts of a Compiler

Maybe this section should be title the parts of the **Cish**
compiler. Not all compilers are the same. Maybe if you follow the
[dragon book](https://en.wikipedia.org/wiki/Compilers:_Principles,_Techniques,_and_Tools),
but Cish does not. In any case, here are the two main steps of the
compiling process:

![Showing code going into compiler to assembly which is in turn assembled into machine code](/img/c-compiler-intro/4x/steps@4x.png)
{class="padded-white medium center"}

This is where some pedantry may enter the conversation because you'll
note that compilation is actually just one step in the
"compiler". This is a fairly common way to describe things
though. Most people mean "compile and assemble" when they use the word
"compiler". However, these are often two distinct prorams, even in
many common *real* C compilers.

At the end of the day we need to produce a sequence of opcodes that
the machine that will execute our program can understand. The set of
opcodes a computer can understand is called its
[Instruction Set Architecture]({{< iref "isa.md" >}}), and the
Theoputer is no different. The Theoputer ISA is the only thing the
Theoputer understands. It doesn't understand C, Typescript, or
English.

But it would be laborious to have to write out all of the opcodes by
hand all the time. Yes you could do that. Early computers even
required that. But that soon becomes not just laborious, but almost
completely unmanageable.

The next-best thing to writing out opcodes is writing their shorthand
versions, which are closer to a familiar language to humans. You can
even see these shorthand versions in the
[current Theoputer ISA](https://docs.google.com/spreadsheets/d/e/2PACX-1vSE5IuwuuaagTtlDdA5kAVRtrjIOu0TMAJLNbj9wNK_MBuyZN0QGJkR1-Wu-uy5JEeAMaSScIFOH-2s/pubhtml?gid=533494001&single=true)
(column 5).

Converting from those shorthand versions to the opcodes is very
straightforward, and that is the job of the assembler. You can read a
lot more about the [Theoputer Assembler]({{< iref "assembler.md" >}})
in the dedicated post.

But once again eventually it becomes too burdensome to write out all
of the assembly and manage the control flow between it. Well that's
not *entirely* true. There are some wizards out there who code in
assembly exclusively. Especially for parts of systems that need to be
heavily optimized. But it's very uncommon and for almost all cases it
is completely overkill.

Instead most programmers write and manage their programs in a
"higher-level language" which gets converted into assembly and then
assembled into machine code.

## Why So High?

It's worth motivating why higher level languages are so useful. After
all, if you've read about the [Theoputer Assembler]({{< iref
"assembler.md" >}}) you may start to think that the juice isn't worth
the squeeze for writing a full blown compiler given how simple an
assembler is.

Apart from how much easier it is to follow and maintain higher-level
language code, there is another critical reason for compilers:
versioning.

Versioning is maybe the single most common engineering challenge out
there. It rears its ugly head all over the place. And it does so even
in the Theoputer.

Imagine you've been working hard, writing assembly programs for the
Theoputer for months. Say you've got 10 programs that are 1000 lines
of assembly code in total. Now let's say that you've decided to add a
new instruction to your ISA! Happy days. This new instruction is
called ==MUL== and it will multiply the contents of register A by the
contents of register B. Why didn't you have this before? Because you
didn't know it was going to be used a lot.

So you go through the process of updating the ISA, reflashing the
[microcoder ROMs]({{< iref "instruction-microcoder.md" >}}), and
loading your new ISA into the assembler. But you're not finished yet!
You have 10 programs, each with an average of 100 lines. It's time for
you to go through all of them and update any cases where you
implemented a multiply operation to use this new instruction. Oh
boy. It is even worth it?!

Oh but now you've discovered there was a critical flaw in one of your
other instructions! You have to adjust how that instruction behaves
and go back through all of those programs and fix everything...

You can see where this is going. The problem here is that you're
creating new *versions* of the ISA, adjusting the setof instructions
the computer understands, and thus necessitating a full pass over
every program you've ever written to use the new version of the ISA.

**Enter in the higher level language.**

Let's say you still have 10 programs. You still add in this new
==MUL== instruction and subsequently find the same flaw. But what
needs to change now? The programs you've written didn't assume any
ISA! Your compiler does, but not the programs. All you need to do is
update the compiler to handle the ISA version and then recompile your
programs!

And *that* is one of the most important reasons to use a higher-level
language. This is even more acute in real computers. Imagine having to
rewrite every program when a new Intel processor comes out. Or having
two entirely different codebases for people how happen to have ARM64
chips and those who have AMD chips. Those will all have different ISA
versions, but you will only need to adjust the compilers and recompile
programs for everything to work.

In short, using a higher-level language abstracts away the details of
the underlying ISA. That abstraction leads to fewer assumptions and
ultimately a better overall system. Ahhhh, engineering. Yum.
