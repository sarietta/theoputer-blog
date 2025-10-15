+++
title = 'Databus'
date = 2025-10-07T15:50:01-07:00
draft = true
categories = ['Sub Systems', 'Computer Engineering', 'Electrical Engineering']
+++

## Introduction

The databus in the Theoputer is like the nerves in your body. It
connects the various cognitive parts of you (e.g. your brain) to the
functional parts of you (e.g. your arm) via physical connections
(nerves) that carry signals (also electrical!).

The Theoputer databus is 16bits wide, meaning it can carry 16 1bit
(low/off/0 or high/on/1) numbers in parallel at once. Originally I had
thought that 8bits "would be enough", because after all this is an
8bit computer! But I think the minimum for an Nbit computer is to have
a databus that's 2Nbits wide, unless you want operations to always
take extra clock cycles and bother with adding additional registers to
store each Nbit number before operating on them.

As far as *what* the databus actually is, well it's not like the other
systems in the Theoputer. It really is nothing more than 16 copper
traces that go all around the board connecting the various other
systems together. I'm also including the buffers (see below) in the
conversation though, because I think it's important to understand how
those other systems can use the same 16 lines in a safe way.

## Contentious Behavior

Imagine you're driving down a single-lane road and a car pulls onto
that road as you're whizzing by. In the best case you're probably
going to be angry that someone would do that. At worst you may find
yourself in a crash.

The databus is similar. It only can handle one signal at a time per
data line. If two things attempt to write to the same data line at the
same time there will be something called **bus contention**. This is
akin to cars crashing but with voltage.

Let's do some good electrical engineering here and look at the cases:

<falstad-circuit
    src="http://localhost:1313/js/circuitjs/circuitjs.html?ctz=CQAgjCAMB0l3BWcMBMcUHYMGZIA4UA2ATmIxAUgoqoQFMBaMMAKAEkKNCQUAWKwgm58qo6EgTtO3bGhCCZcsRKkKe-EBjkioUcRVVCQsqlqondMFQBlp62ijz3LIAGYBDADYBnOtUgstghcxnIIjqGiuh4+fkgBHHiyPFogxGAoKZnKBgBOIEmZmJmFxoROVGDwLADmBcnY5fWZ-FEB+WbOpcW6VXAsHXIW3amV1RzpRamkU9l6KgCyacSzyBo9VCjiLEszILzE3FUaB9yb2xMZ+4fLLTc5koO0vLzN12fI-U-7hK+lp71qnVSggVm9CHxLAM3gCQWCxv1EskAZN3pZ9JIgiEEC8KBEca9Km4vL5-IE7LxfninJTCeBibEyRw1ATNGFcQ9DNxaWyqDzORxgtxWSyOfMDIKQjy1PzxZJJdxCKk1Eq5lYJXYMOF5EYtWqMVz5KlOqr0SpmbrtZ09WaDFjFalwk5TUSYqT4uShZptU7vWqGe6oFJShhIK9UaG6erHm9I288HBAf1gckE1RSqVRNCTakQ2Gk+1eX7Y-mEQk0lc43s45zdmC48dTKWeNsAB48TApPkRXB89QgABCAFdvAAdbwAYQA9gA7AAudHnAEtZ6PRzOABQAFQA7lPx9YpzvxwB5IdzgAO5+8AEoWO2UGAaWR9pDwuRXpDh2PJ7OF8vV3Xbc93HAAJJcagAC1Pc8rznW973AYhnRuShMi0bl+2-cdp3nRc5xXGc103E8ZzoA8jwAGlPMiwIg6DvDPS9zzvIA"></falstad-circuit>

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
