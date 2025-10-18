+++
title = 'Ram'
date = 2025-10-11T00:09:58-07:00
draft = true
+++

## Introduction

Even the randomnest of memories is useful, some say. Hopefully that's
the case in the Theoputer's Random Access Memory (RAM) as well.

RAM is often differentiated from other places data is stored along two
dimensions:

1. It's faster and smaller than long-term, non-volatile storage (e.g. harddisks)
1. It's slower and larger than registers

To say that RAM is volatile is to say that it requires constant power
to stay valid. This is not the case with something like a magnetic
drive, where the little magnetic poles can stay in whatever state they
were set for a very long time without power. Solid-state drives extend
this idea (with A LOT more complexity) to storing information,
powerless, for a long time in semiconductors.

But RAM is almost always volatile. In theory in the modern world you
*could* use non-volatile chips like a FRAM to store data without
power, but that would be cost-prohibitive. It's far more appropriate
to let the harddrives do their job (storing data that needs to be
outlive the power cycle) and let the RAM do its job (store data while
the computer is running).

The Theoputer's RAM is akin to normal RAM, but in complete truth the
RAM chip for the Theoputer
([IS61C6416AL-12TLI](https://www.issi.com/WW/pdf/61C6416AL.pdf)) is
fast enough to run at the same speed as the rest of the computer so we
could actually use it for registers.

I opted against this because at some point the computer may get fast
enough that this is important and because it would be much harder to
debug the contents of memory than it is to debug the contents of the
[registers]({{< iref "register.md" >}}).

## Addressing the RAM

Here is the schematic of the RAM interface, which itself (along with
the RAM) is part of the [daughter board]({{< iref "daughter-board.md"
>}}):

<svg-viewer
    viewBoxX="428.2962528796617" viewBoxY="226.01953853672882" viewBoxWidth="185.51462935076557" viewBoxHeight="131.20680744124337"
    src="/img/daughter-board/Daughter Assembly.V8-20250912.svg">
</svg-viewer>

The gates and the JK flip-flop are there to help coordinate the
handoff between [executing instructions from ROM]({{< iref
"overview.md#fetch-and-decode" >}}) (the default) to executing them
from RAM. There is a dedicated post to that upgrade as well,
describing how the Theoputer [executes RAM instructions]({{< iref
"ram-instructions.md" >}}).

Ignoring for now the gates at that JK flip-flop, let's look
specifically at the four control signals (~~^MA^~~, ~~^MI^~~,
~~^MO^~~, ~~^CLK^~~) and the 16 bit [databus]({{< iref "databus.md"
>}}) lines (~~DBUS{0-15}~~):

- ~~^MA^~~: Indicates that we want to write to the memory address
  register
- ~~^MI^~~: Indicates that we want to write to memory
- ~~^MO^~~: Indicates that we want to read from memory
- ~~^CLK^~~: The clock signal to ensure we execute data operations on
  a ~~↑CLK~~ transition
- ~~DBUS{0-15}~~: Data lines for whichever operation (memory address,
  write data, read data) we're performing

Let's talk about that ~~^MA^~~ signal paired with the 16 databus lines
because it may not be immediately clear why we would need such a
mechanism.

In the schematic above you can see that there is only one set of lines
connecting to the databus (~~DBUS{0-15}~~) just like most of the other
systems in the computer. Something different about this system,
however, is that we are not really accessing a single data source but
rather a very large bank of them. In particular, you can think of RAM
in the Theoputer as just array of registers albeit much slower.

Because we effectively have a bank of registers we can read/write
from/to, we need a way to address them. We need to know *which*
register to speak with. Just like all other operations in the
Theoputer, the way we want to specify such an address is through the
databus lines. Using the databus to set the memory address will allow
us to control that address via any other part of the system that can
write to the databus lines like the actual registers.

But this introduces a subtle problem. We cannot simultaneously use the
databus lines to hold the memory address and at the same time hold the
contents of the read/write memory operation. Thus we need an
intermediate storage place to hold the memory address first and *then*
read/write the contents of memory at that address to/from the data
bus.

In short we need a register to hold the memory address during a memory
operation. In the Theoputer, since the beginning, memory addresses are
16bit long and thus we need a 16bit (or two 8bit registers) that can
be enabled and disabled (~~^MA^~~) independently of the memory
read/write operation signals (~~^MO^~~ and ~~^MI^~~). 

To help make this a bit more concrete, let's look at the
[microcode instructions]({{< iref "instruction-microcoder.md" >}}) for
the memory read operation:

```nasm
;; CBA: Copy Register B to RAM address stored in Register A
MA, AO
MI, BO
PS
```

> Note: These microcode instructions are not real in the sense there
  is no actual assembly language that understands them. They are just
  demonstrative.

Imagine if we didn't have this dedicated ~~^MA^~~ line and also lacked
a memory address register:

```nasm
;; CBA: Copy Register B to RAM address stored in Register A
AO, MI, BO
PS
```

Well that's a problem! We now have two outputs from registers A and B
causing [bus contention]({{< iref "databus.md#contentious-behavior"
>}}) and the circuit will have no way to determine whether the address
should come from A or B nor whether the data to be stored in memory
should come from A or B. Lots of problems!

But the solution is simple enough as described and leads to a slightly
more complex circuit:

<svg-viewer
    viewBoxX="32.508034589442076" viewBoxY="57.008135768913036" viewBoxWidth="327.9763320031253" viewBoxHeight="231.98795096526058"
    src="/img/daughter-board/Daughter Assembly.V8-20250912-RAM.svg">
</svg-viewer>

You can see (maybe if you zoom in) that this setup looks a lot like
the [register interface]({{< iref "register.md" >}}) except we are
dealing with 16bit values instead of 8bit values. There are two
buffers coming from the databus into RAM

## RAM, What is Good For?

Now that we can address RAM, we need to understand how and why it's
important. As noted, you can think of RAM as just a large bank of
registers. That means it's particular useful to store values you might
need during the course of executing a program.

But it may not be immediately clear what kinds of intermediate values
would be helpful to store. Especially given there's already a few
registers lying around. Your mind may jump to things like arrays of
data and that's a good intuition. RAM is an array of registers so it
stands to reason that it would be useful for storing arrays of data.

Well really any data during the lifetime of a program is helpful to
store potentially. You could think of all of the variables in a
program as just part of some large variable array. This isn't far off
from what the bulk of the RAM is intended to be used for in a program.

It's hard to appreciate when just writing assembly how useful RAM can
be. It becomes painfully apparent when writing in a higher-level
language, like [Cish]({{< iref "cish.md" >}}). Maybe more accurately
is that it becomes *very* apparent when writing a
[C-like compiler]({{< iref "c-compiler-intro.md" >}}). That's because
the RAM starts to become a more integral part of the computer itself
once there is the notion of a heap and a stack. If you're only ever
writing assembly, it's hard to keep track of the complexities of a
stack and thus the concept of a stack becomes less useful.
