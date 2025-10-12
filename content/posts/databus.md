+++
title = 'Databus'
date = 2025-10-07T15:50:01-07:00
draft = true
categories = ['Sub Systems', 'Computer Engineering']
+++

As a quick example, imagine you wanted to copy the contents of
Register A to Register B (see below for a slightly deeper explanation
of registers). We could have dedicated lines connecting A and B easily
enough, but what if we wanted to instead copy Register X to Register
B? Now we have a problem. We either need *another* set of lines (eight
in this case since the registers are 8bit) and we need a way to tell
Register B to take the data from the lines coming from Register X and
ignore anything on the lines coming from Register A. You can see that
this quickly becomes incredibly complex as you add more things that
need to read/write from/to each other.

Instead we have this single data bus that everything uses. But we still have the problem of enabling/disabling
