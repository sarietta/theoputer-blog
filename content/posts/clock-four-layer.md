+++
title = "The 4 Layer Clock Board"
date = 2025-09-23T14:17:11-07:00
draft = true
math = true
categories = ['Sub Systems', 'Electrical Engineering']
tags = ['Clock']
+++

## Introduction

The clock circuit outlined in the [Clock Extras]({{<iref
"clock-extras.md" >}}) post ended up working out fairly well apart
from the issues related to the ~~CLK~~ signal itself acting like a
[Transmission Line]({{<iref "transmission-line-reflections.md"
>}}). However, given how important the clock is to the function of the
Theoputer I thought it prudent to do one last design (famous last
words) that incorporates *real* engineering principles. At least the
ones that I know about, which in this domain are few.

The biggest improvement I set out to make was in reducing "noise" in
the clock output. Noise can come from a lot of places, but by this
point I had done a decent job of adding decoupling capacitor and
transmission line source resistors. The final piece was to remove as
much ground bounce as possible. This is a very complex topic and was
mostly foreign to me when I
started. [This video](https://www.youtube.com/watch?v=kdCJxdR7L_I)
from Eric Bogatin and Robert Feranec was my real go to source when
learning about how to design the PCB layout in an effective way. Most
of this post is just a regurgitation of their content, with a specific
application in the Theoputer clock.


<kicanvas-embed src="/pcb/Clock.V6-20250408.kicad_pcb" controls="basic+"></kicanvas-embed>
