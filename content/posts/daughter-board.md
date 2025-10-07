+++
title = 'Daughter Board'
date = 2024-12-20T22:08:56-08:00
draft = true
+++

## Introduction

This is more of beach head than anything. The "Daughter Board" is very
complex and contains a considerable amount of the actual "CPU", so a
single post about it isn't really feasible. This should just serve as
more of a tour around the board itself, with pointers to the
individual parts in much more detail.

I'll also take this moment to share a fun note. One of the tenets I've
tried to adhere to in designing and building the Theoputer is to limit
outside help. It's not so much that I don't want/like help, but more a
way to see if I could figure things out on my own. I am, after all,
officially an "expert" of Computer Science and in my hubris have a
small inkling that I could discover something interesting because I
lack the curse of knowledge in this case.

So far, nothing novel. However! The name of this board is a funny
situation. When I was designing the earliest parts of the Theoputer I
knew that I need to work incrementally and modularly. The
[8Bit Register]({{< iref "register.md" >}}) and the [ALU]({{< iref
"alu.md" >}}) were two of the first boards I ever made, but I quickly
needed a way to connect them. I thought to myself:

    "Self. You have these little boards, like little daughters. Plug
    them into a larger board that contains them. Clearly called the
    Daughter Board!"

It took me a good year before it dawned on me that I had "re-invented"
the *Mother*board, but missed the now-obvious relationship between
daughters and mothers. Alas. I'll chalk it up to my own daughter not
having been born until after I coined the term.

## A Tour Around the Board

Here is the current version of the Daughter Board:

<kicanvas-embed
    src="/pcb/Daughter Assembly.V8-20250912.kicad_pcb"
    layers="Edge.Cuts, F.Fab, F.SilkS, Holes, Vias, F.Cu, B.Cu, Pads, F.Silkscreen"
    controls="basic+"></kicanvas-embed>

That's a lot, and it doesn't even really tell the full story, because
the entire point of (incorrectly) naming this thing a "daughter" board
is that there are other boards that plug into it! It's probably very
hard to even see the outlines of those boards from the complex viewer
above. So let's simplify things a bit and just look at the pieces:

<kicanvas-embed
    src="/pcb/Daughter Assembly.V8-20250912.kicad_pcb"
    layers="Edge.Cuts, F.Fab, F.SilkS, Holes, F.Silkscreen, Pads"
    controls="basic+"></kicanvas-embed>

This view just shows the outlines of the boards, the chips on the
Daughter Board, and a few pieces of information that will end up being
printed onto the printed circuit board during fabrication.

There are twelve sections we will look at briefly, with pointers to more
in-depth considerations:

1. Data Bus
1. Registers
1. Program Counter
1. ALU
1. Branch Control
1. Instruction and Control
1. Clock
1. I/O
1. Power
1. RAM
1. Stack Pointer
1. SD Card

### Data Bus

The data bus isn't really a section of the board because it is a group
of traces that go all over the board. Fundamental to the operation of
the Theoputer is the concept that data of any form is "put onto" and
"read from" a single group of 16 wires. By controlling which other
parts of the Theoputer are either reading or writing to/from these 16
wires we are able to perform nearly all of the operations of the
CPU. Here are those lines, ~~DBUS0~~ through ~~DBUS15~~, crossing the
board on the bottom layer (blue):

<kicanvas-embed
    initialZoom="15.993706037266339" initialX="92.68390870438668" initialY="67.25556307779696"
    src="/pcb/Daughter Assembly.V8-20250912.kicad_pcb"
    layers="Edge.Cuts, F.Fab, F.SilkS, Holes, F.Silkscreen, Pads, B.Cu, Vias"
    controls="basic+"></kicanvas-embed>

You can read more about what the data bus is and why it's important in
the [data bus post]({{< iref "databus.md" >}}), but for now just note
that it goes everywhere! Connecting up all the things that need to
speak to each other, and with 16bits of data. It's worth also noting
that the data bus is often considered as two separate buses, a "low"
8bit bus comprised of the lines ~~DBUS0~~ through ~~DBUS7~~ and a
"high" 8bit bus comprised of lines ~~DBUS8~~ through ~~DBUS15~~.

### Registers

There are actually several "kinds" of registers on the Theoputer, but
this section is dedicated to the "CPU registers". If you've studied or
used other CPUs at a low level this concept will be
straightforward. If not, a register is a jargon-y word for a circuit
that can store a value indefinitely, until you decide you want to
store a different value. Very similar to "memory", but usually *much*
faster although in the Theoputer case the speed difference doesn't
currently matter.

The post about [Registers]({{< iref "register.md" >}}) contains a lot
of the details about how registers work on a low-level and how they
work at a high-level in the Theoputer. But for the tour, the main
takeaway is that there are four "general purpose" CPU registers, an
ALU register, and a CPU status register.

<kicanvas-embed
    initialZoom="8.062270948077959" initialX="74.74011838224975" initialY="44.36358206745628"
    src="/pcb/Daughter Assembly.V8-20250912.kicad_pcb"
    layers="Edge.Cuts, F.Fab, F.SilkS, Holes, F.Silkscreen, Pads"
    controls="basic+"></kicanvas-embed>

#### Registers A, B, Y, and Z

Registers A, B, Y, and Z are general purpose in the sense that they
are controllable by a programmer. You can write and read to these
registers freely, e.g. via the instruction ==LAI 0x3A== which Loads A
with an Immediate byte value \(\textrm{3A}_{16}\). Registers A and B
have been around in the Theoputer since its inception, while Y and Z
were added in version three.

The only notable difference between these registers is that Register B
is the only register that can address, and be addressed (as of V7+),
the upper eight data bus lines ~~DBUS8~~ through ~~DBUS15~~. This
ability is critical to certain instructions that need to read/write
the "high" byte on the data bus.


#### ALU Register: X

ALU operations produce 8bit values that are stored in Register X after
any ALU operation. Only the ALU can write to this special register,
but it can be read from "normally" in the sense that there is a read
signal (~~^XO^~~) that will cause the contents of Register X to be put
on the low byte of the data bus (i.e. lines ~~DBUS0~~ through
~~DBUS7~~). There is a little bit of extra gate logic to get this work
correctly:

<svg-viewer src="/img/daughter-board/Daughter Assembly.V8-20250912.svg" viewBoxX="231.40858850885093" viewBoxY="4.114708436376851" viewBoxWidth="208.6715548143096" viewBoxHeight="147.48091806451615">
</svg-viewer>

If you follow the logic you'll see that Register X is only written to
during an ALU operation (on the ~~↑CLK~~ signal as always) and can
only be read from onto the data bus low byte lines.

> Note: If the NOR gate with an inverted ~~^CLK^~~ signal as the
  ~~Cp~~ input signal on the register is unintuitive/confusing at
  first glance, checkout [Registers]({{< iref "register.md" >}}) to
  see the details for why that makes sense.

#### CPU Status Register

The CPU status register is similar to Register X in that it cannot be
written to by programmers, but can be read from. Its purpose is to,
well, contain information about the status of the CPU. At first that
might seem like a weird thing to need/do, but the kind of status that
it captures is critical to certain operations. Here's the schematic of
it:

<svg-viewer src="/img/daughter-board/Daughter Assembly.V8-20250912.svg" viewBoxX="4.4079200958406375" viewBoxY="2.781470489111899" viewBoxWidth="181.53652549243606" viewBoxHeight="128.30293743529896">
</svg-viewer>

You can see that it only captures three bits of data:

1. The state of the signal ~~ALU_OFLOW~~
1. The state of the signal ~~ALU_CARRY~~
1. The state of the signal ~~INT_0~~

It turns out that the last signal ~~INT_0~~ isn't even implemented so
it's only two bits! But those are critical bits of information,
containing the last status of the ALU since clearing the status
register via ~~^CR^~~. And those two bits are necessary to deal with
[ALU subtraction]({{< iref "alu-subtraction.md" >}}) and general
overflow conditions of the ALU.

> Note: Getting this simple register to work correctly has been a
  journey that I've not enjoyed at times. I went back and forth on
  ways to implement the ALU statuses, etc. that would avoid having a
  dedicated reset signal and instruction but eventually had to
  acquiesce because all my other strategies created breaking bugs.

### Program Counter

### I/O


### ALU


### Branch Control

### Instruction and Control


### Clock


### Power


### RAM


### Stack Pointer


### SD Card
