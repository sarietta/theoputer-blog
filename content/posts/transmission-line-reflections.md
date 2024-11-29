+++
title = 'Transmission Line Reflections'
date = 2024-11-09T13:49:41-08:00
draft = true
+++

## Introduction

Whoooo boy. This one was a real challenge for me, an amatuer computer
engineer. As I was working through the issues in the [IRQ Mistake]({{<
ref "irq-mistake" >}}), I realized that the real issue was much deeper
than I had expected.

I spent the better part of two weeks attempting to figure out why my
circuit (not that important as it turns out) was behaving as if one of
the JK flip flops was transitioning in an "impossible" way.

It turns out, I didn't know about something called "transmission line
reflections".

## There Is No Perfect Square Wave

Electricty (both current and potential energy) behaves like a wave
when a circuit changes the electricty in the circuit. This is a
simple-enough statement, but it's hard to appreciate the implications
this has. Sure, a clock signal is definitely wave-like, but it is
almost always modeled as a discrete stream of *pulses*. But
**everything is a wave**, and the clock is no exception.

Without diving too deep into the innards of oscillators, partly
because they are a bit beyond my depth of understanding, it's
sufficient to note that any thing that oscillates is producing some
sort of wave.

It's also important to note that things that produce waves, can
*never* be truly digital. This is an annoying consequence of math,
essentially. Or physics, depending on your philosophical views. Here's
a visualization of part of the problem:

![Fourier Approximation of Square Wave - 10 Terms](img/transmission-line-reflections/fourier-10-terms.png)
{class="center padded-white small"}

The red line is a square wave and the black line is the sum of 10 sine
waves, each of which has an increasing frequency. The frequencies are
chosen according to something called the [Fourier
Series](https://en.wikipedia.org/wiki/Fourier_series). The frequences
are often just referred to be their index: first, second, third,
etc. And these indexes are often also referred to as the *harmonics*,
a term that means the same thing in music :).

When an oscillator oscillates, it will always *approximate* a square
wave pulse generator. This is always true, and while the underlying
math/physics requires some non-trivial concepts, the intuitive
approach is pretty rewarding.

Lets imagine the electricity that a clock circuit produces starts at
"0" and increases its max value, which we'll call "1". As the
oscillator approaches "1" it needs to stop increasing its electricity
so it can flatten out at "1":

![Momentum options](img/transmission-line-reflections/2x/momentum@2x.png)
{class="center padded-white"}

Reductively, the red point needs to either take something like the
blue path or the orange path. This is because nothing can
instantaneously alter its course/energy/eletricty/momentum. All things
in nature require some time to change their path. You could even image
the red dot has momentum according to the red arrow and note that
momentum cannot change instantly.

![Momentum options](img/transmission-line-reflections/2x/momentum-simple@2x.png)
{class="center padded-white"}

The blue path won't achieve the "1" value until after we might
expect. The orange value does achieve the "1" value when we expect,
but it then must compensate because it cannot instaneously stop at
that value. If you play the orange trajectory in your mind, you'll
notice that it's also possitble that there will be an oscillation as
the orange line attempts to recover back and forth around the "1"
value. You can see this exact phenomenon in the approximation we
looked at:

![Fourier Approximation of Square Wave - 10 Terms](img/transmission-line-reflections/fourier-10-terms.png)
{class="center padded-white small"}

Let's crank up the number of terms in this approximation to see what
happens when we try very hard to quickly hit "1" and stay there:

![Fourier Approximation of Square Wave - 300 Terms](img/transmission-line-reflections/fourier-300-terms.png)
{class="center padded-white small"}

This is the exact same approximation (the Fourier Series one) with 300
terms instead of ten. We can never escape this! We must choose between
three options:

1. The wave looks smoothed near the peaks, and arrives at those peaks
   later than expected.
1. The wave overshoots the peaks, and recovers slowly and smoothly to
   the peaks.
1. The wave overshoots the peaks, and oscillates around the peaks
   quickly settling on the peaks.

Option (2) is actually the same as (3) because there will always be
some leftover energy to oscillate against, but for
explanatory/intuitive purposes I find it's helpful to separate them.

There are formal names for these, and wonderful physics reasons for
them. Well, wonderful in the majestic sense. Not super for computer
engineering as we'll see. For a superb treament of these "damped
oscillator" configurations, I highly recommend [Hyper
Physics'](http://hyperphysics.phy-astr.gsu.edu/hbase/oscda2.html)
explanation.

For completeness, this is what option (1) looks like, which is also
called an *overdamped* oscillator:

![Fourier Approximation of Square Wave - Overdamped](img/transmission-line-reflections/fourier-overdamped.png)
{class="center padded-white small"}

## Reflections
