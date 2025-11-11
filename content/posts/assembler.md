+++
title = 'Assembler'
description = "Small but mighty the assembler be. Some programming wizards might claim an assembler is all you really need to melt faces. Mere mortals such as myself work better with a compiler, but an assembler is still absolutely necessary."
date = 2025-11-10T20:52:11-08:00
draft = false
categories = ['Computer Engineering', 'Computer Science']
tags = ['Compiler']
+++


## Introduction

For a long time I only ever had an assembler. It was the first and
really the only way to write programs for the Theoputer in the
beginning. I sure as hell wasn't going to write out the machine code
by hand!

As I started writing longer and more "interesting" programs I started
to get that itch to make things better. And that itch turned into a
full blown rash that led to the [Cish compiler]({{< iref
"c-compiler-intro.md" >}}). But to have a chance at understanding that
behemoth, I encourage you to learn about this far simpler and
necessary component of the compilation stages.

## Overview

The assembler's job is to take simplified, short versions of the
opcodes that are more human readable and produce the actual opcodes
(as binary data) so the Theoputer can understand the instructions.

The translation from *assembly* to opcodes is fairly
straightforward. If you lookat each instruction listed in the
[current Theoputer ISA](https://docs.google.com/spreadsheets/d/e/2PACX-1vSE5IuwuuaagTtlDdA5kAVRtrjIOu0TMAJLNbj9wNK_MBuyZN0QGJkR1-Wu-uy5JEeAMaSScIFOH-2s/pubhtml?gid=533494001&single=true),
you will see a "Short" version of the instruction listed. That is the
assembly language!

It's slightly more complicated than that, but for now just think about
how you would write a program to convert the following assembly
instructions into Theoputer opcodes:

```nasm
LAX
LBX
ADD
HLT
```

You would likely just iterate through each line, extract the
characters on the line, search for the extracted characters in the
list of short codes in the file linked above, and then write out the
corresponding opcode from that same file.

You can even do that by hand if you want (don't bother) and you'd get
the following:

```
01000010 00000000
01000011 00000000
01010001 00000000
01000111 00000000
```

If you were to flash that to a set of ROM chips via the
[ROM Programmer]({{< iref "rom-programmer.md" >}}), plug those ROM
chips into the [Instruction and Control board]({{< iref
"instruction-and-control.md" >}}), and power the Theoputer, you would
find it performing the instructions listed.

The Theoputer assembler does that too. But it does have a few
additional features that are fairly important.

## Assembler Features

The assembler is not particularly complex. Certainly not compared to
the [Cish compiler]({{< iref "c-compiler-intro.md" >}}). It has a
couple features that are notable, however, both of which are
implemented with regular expressions and some simple data structures:

1. Parameterized Instructions: Allows a programmer to specify the arguments to a parameterized instructions.
1. Labels: Allows a programmer to refer to locations in code by label versus by line number

### Parameterized Instructions

The first is the ability to handle parameterized instructions. Let's
consider the instruction ==LAI 0x10==. You can write this as an
instruction and the assembler will do the right thing. But doing the
right thing in this case is different from simply looking up the short
code from the ISA and replacing it with the opcode binary. In this
instruction there is an arbitrary 8-bit value the programmer can
specify.

Moreover, notice that the 8-bit value is specified in hexadecimal
notation with the leading ==0x==. The assembler can also handle
decimal values here, so ==LAI 16== will generate the same opcode.

This works via a simple regular expression match, paired with a list
of instructions that take parameters.

The list of parameterized instructions is constructed by goign through
the rows of the ISA and finding how many of the opcode bits are
non-numeric. As an example, consider the row for the ==LAI==
instruction:

| B16 | B15 | B14 | B13 | B12 | B11 | B10 | B9 | B8 | B7 | B6 | B5 | B4 | B3 | B2 | B1 |
|--|--|--|--|--|--|--|--|--|--|--|--|--|--|--|--|
| 0 | 1 | 1 | 0 | 0 | 0 | 0 | 0 | I08 | I07 | I06 | I05 | I04 | I03 | I02 | I01 |

Notice those "I" entries are not numbers, and the ISA loader uses that
to determine that this instruction takes a parameter and determines
that parameter is 8-bits long.

When the assembler reads a line and finds an instruction that takes a
parameter (often referred to as an immediate value) it attempts to
parse everything after the space as a number. There are a few checks
to determine if there is a leading '0x' or a leading '-' to generate
the binary value to fill the parameter bits accordingly.

So, if the assembler encounters ==LAI 0x10==, it will determine that
==LAI== takes a parameter that is 8-bits long. It will then look at
the ==0x10== part and determine there is a leading '0x' and thus parse
the value '10' as a hexadecimal number, resulting in the final opcode:

| B16 | B15 | B14 | B13 | B12 | B11 | B10 | B9 | B8 | B7 | B6 | B5 | B4 | B3 | B2 | B1 |
|--|--|--|--|--|--|--|--|--|--|--|--|--|--|--|--|
| 0 | 1 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 |

If you want to carry this through to actual execution, check out how
the Theoputer deals with [instruction data]({{< iref
"instruction-and-control.md#instruction-data" >}}) on the execution
level. If you're also curious how negative numbers would be converted
to binary, check out the post about [ALU subtraction]({{< iref
"alu-subtraction.md" >}}).

### Labels

Part of building good software is about anticipating the future. Often
that prescience comes from experience, and this feature is a great
example of that.

It's inevitable that you will update almost every program you ever
write. When you do that, any assumption about the layout of your
program are now invalid. Let's take a simple example:

```nasm
0: LAI 0    ; A = 0
1: LBI 10   ; B = 10
2: SUB      ; X = B - A
3: BEQ 8    ; if X == 0, jump to line 8
4: LBI 1    ; B = 1
5: ADD      ; X = A + B = A + 1
6: LAX      ; A = X = A + 1 -> A++
7: JMP 1    ; jump to line 1
8: HLT      ; halt
```

If you're not familiar with [Theoputer Assembly]({{< iref
"assembly.md" >}}), hopefully the comments will suffice along with
line numbers. This is a simple program that just loops 10 times and
then halts.

Now imagine we wanted to insert one new instruction at the beginning
of the program to set register B to 0, for whatever reason:

```nasm
0: LBI 0
1: LAI 0    ; A = 0
2: LBI 10   ; B = 10
3: SUB      ; X = B - A
4: BEQ 8    ; if X == 0, jump to line 8
5: LBI 1    ; B = 1
6: ADD      ; X = A + B = A + 1
7: LAX      ; A = X = A + 1 -> A++
8: JMP 1    ; jump to line 1
9: HLT      ; halt
```

Well now we have a problem. The two jump instructions ==BEQ 8== and
==JMP 1== now point to the wrong locations! In this case we could
easily update the values, but imagine having to go through every
program every time you update any lines to make these adjustments.

The problem here is that we have hard-coded assumptions about the
layout of the program in the program itself. Instead of makign that
assumption we can just as easily have the assembler figure out the
correct locations for us! And for an added bonus, we can avoid having
to look at line numbers, which aren't very human-friendly:

```nasm
RESET:
LAI 0    ; A = 0

LOOP:
LBI 10   ; B = 10
SUB      ; X = B - A
BEQ DONE ; if X == 0, jump to label DONE
LBI 1    ; B = 1
ADD      ; X = A + B = A + 1
LAX      ; A = X = A + 1 -> A++
JMP LOOP ; jump to label LOOP

DONE:
HLT      ; halt
```

That is much easier to read and we can easily add new instructions
without touching the jump operations. In the assembler code we just
detect whether the instruction takes a parameter and if the parameter
is non-numeric (i.e. starts with a letter) we assume it's a label.

This does mean that the assembler has to do some bookkeeping to hold
on to labels that are referenced earlier than they are defined so that
we can resolve those labels, but that's not too challenging. We just
build up a list of "unfilled" immediate values and then, as we
encounter labels, we fill in the unfilled values accordingly.

#### Multi-byte labels

If you've read about [long-argument instructions]({{< iref
"instruction-and-control.md#long-argument-instructions" >}}) then you
know that there are instructions in the Theoputer that are longer than
a single byte.

Moreover, the more "modern" approach for generic jumping around in the
Theoputer is to use the instructions that use the values in registers
A and B together to provide access to the full 16-bits of ROM and RAM.

The examples above all assume the labels are placeholders for 8-bit
values. The instruction ==JMP==, for instance, only takes an 8-bit
immediate value. To handle multi-byte labels, there is a special
syntax that the assembler supports:

```nasm
RESET:
;; Jump to main
LBI BYTE1[__MAIN]
LAI BYTE0[__MAIN]
JPP
...

__MAIN:
LAI 0x10
...
```

The lines ==L{A,B}I BYTEN[__MAIN]== instruct the assembler to
calculate the location of the ==__MAIN== label, and then return the
Nth byte of that location. So if ==__MAIN== happened to be at offset
\(2384_{10} = 950_{16}\) in the final assembly program (with empty
lines, comments, etc. all stripped out), then the above would resolve
to:

```nasm
0: LBI 0x09
1: LAI 0x50
2: JPP
...

2384: LAI 0x10
...
```

## Just One Piece

The assembler is technically part of the entire compiler pipeline,
providing the necessary translation from a set of opcodes to the
actual machine code that the Theoputer can execute directly. It's
pretty simple and straightforward, providing a great starting point on
the journey to understanding the full [Cish compiler]({{< iref
"c-compiler-intro.md" >}}).
