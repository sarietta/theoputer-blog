+++
title = 'Ram'
date = 2025-10-11T00:09:58-07:00
draft = true
+++

Originally RAM was only used in the Theoputer as a place where
programs could store and retrieve data to/from. Much like the
computers of yore it became clear, eventually, that using RAM to also
be able to store *instructions* was a game changer. At that moment,
the RAM system became a lot more complicated.

It's hard to show on the board where RAM is nowadays with this added
complexity, but it's roughly here:

<kicanvas-embed
    src="/pcb/Daughter Assembly.V8-20250912.kicad_pcb"
    initialZoom="10.474983933423788" initialX="28.02231950155481" initialY="125.06475900722437"
    layers="Edge.Cuts, F.Fab, F.SilkS, Holes, F.Silkscreen, F.Cu:0.5, Vias:0.5, B.Cu:0.5, Pads"
    controls="basic+"></kicanvas-embed>

Without diving into the internals of how the RAM system works (that
you can find in the dedicated [RAM]({{< iref "ram.md" >}}) post),
here's the schematic of the daugher board interface to it:

<svg-viewer
    viewBoxX="428.2962528796617" viewBoxY="226.01953853672882" viewBoxWidth="185.51462935076557" viewBoxHeight="131.20680744124337"
    src="/img/daughter-board/Daughter Assembly.V8-20250912.svg">
</svg-viewer>

The gates and the JK flip-flop are there to help coordinate the
handoff between executing instructions from ROM (the default) to
executing them from RAM. There is a dedicated post to that upgrade as
well, describing how the Theoputer [executes RAM instructions]({{<
iref "ram-instructions.md" >}}).

For now the important things to note are that there are a set of
control lines that determine whether RAM should output its contents to
the ~~INST{0-15}~~ instruction bus (~~^ROM^~~, ~~EXEC_MODE_RAM~~, and
~~STEP~~) and there are a set of control lines for the memory itself
to control the address to operate on (~~^MA^~~) and whether the
operation is an input (~~^MI^~~) or an output (~~^MO^~~).

It may not be immediately clear why we need to have a dedicated
~~^MA^~~ signal and corresponding 16bit memory address register. In
the schematic above you can see that there is only one set of lines
connecting to the data bus (~~DBUS{0-16}~~) just like all of the other
registers in the computer. Something different about this system,
however, is that we are not really accessing a register but rather a
very large bank of them. That's effectively what memory is, albeit
much slower.

Because we have (effectively) a bank of registers we can read/write
from/to, we need a way to address them. Just like all other operations
in the Theoputer, the way we want to specify such an address is
through the data bus lines. That allows us to use the contents of
registers, etc. to set that address. That presents a challenge. We
cannot simultaneously use the data bus to hold the memory address and
hold the contents of the read/write memory operation. Thus we need an
intermediate storage place to hold the memory address first and *then*
read/write the contents of memory at that address to/from the data
bus.

In short we need a register to hold the memory address during a memory
operation. In the Theoputer, since the beginning, memory addresses are
16bit long and thus we need a 16bit (or two 8bit registers) that can
be enabled and disabled (~~^MA^~~) independently of the memory
read/write operation signals (~~^MO^~~ and ~~^MI^~~). To help make
this a bit more concrete, let's look at the microcode instructions for
the memory read operation:

```nasm
;; Copy Register B to RAM address stored in Register A
;; CBA
MA, AO
MI, BO
PS
```

> Note: These microcode instructions are not real in the sense there
  is no actual assembly language that understands them.
