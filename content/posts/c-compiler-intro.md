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

Maybe this should be the parts of the Cish compiler. Not all compilers
are the same. Maybe if you follow the
[dragon book](https://en.wikipedia.org/wiki/Compilers:_Principles,_Techniques,_and_Tools).
