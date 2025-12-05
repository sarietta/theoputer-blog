+++
title = 'Recursion'
description = "Have you ever wondered why everyone makes such a fuss about recursive functions? Wonder no longer! I have finally cracked the proverbial nut on why every Computer Science curricula under the sun seems to weight this seemingly esoteric topic so heavily. Join me."
date = 2025-12-03T10:41:11-08:00
draft = false
image = '/img/recursion/header.png'
categories = ['Computer Science', 'Computer Engineering']
tags = ['Compiler']
+++

## Introduction

This may be the most valuable post of the entire Theoputer blog. At
least for me. It was only through the process of thinking through how
to support recursion in the Theoputer, and more specifically the
[Cish language/compiler]({{< iref "cish-grammar.md" >}}), that I
finally answered two 20+ year-old questions:

1. Why are recursive functions so special?
1. Why do we really need an execution stack and a [stack pointer]({{< iref "stack-pointer.md" >}})?

On the surface those two questions never seemed related to me. It's
not for lack of formal education either. I was a Computer Science
Ph.D. for many years and before/during/after that a software
engineer. I recall several courses, notes, and educational materials
talking about recursive functions and stacks and it just seemed so
arbitrary to me.

No one ever explained to me the connection between these two ideas and
more importantly *why* you need something like an execution stack if
you hope to support all programs that can be written in a language
that has functions.

So here is my attempt. I "stumbled" upon this connection as I was
building out the Cish compiler for the Theoputer. It finally clicked
for me. I felt a sense of excitement but also a feeling of
disappointment. Disappointment in my teachers and mentors of years
past who never sat me down and helped me understand this connection.

Here we go. Let's start by talking about recursive functions.

## Recursive Functions

If you've taken some Computer Science courses you may have come across
this idea of a recursive function. You may also have wondered why it's
discussed. On the surface isn't it just a function? Why do we talk
specifics about recursive functions in particular? We should treat all
functions the same, and thus a specific chapter or day of instruction
focused on this one particular and not-often-used type of function
seems extremely odd.

If you've had those thoughts then you're in good company. If you've
not had the pleasure of learning about recursive functions, then let's
take a look at one of the most classical examples.

### Quick Introduction to Recursion

Let's look at one of the simplest and often used examples of
recursion:

```c
int arithmetic_sum(int N) {
  if (N == 1) {
    return 1;
  } else {
    return N + arithmetic_sum(N - 1);
  }
}
```

For completeness, let's trace out the program execution by hand. For
any number \(N > 1\), the second branch will be taken resulting the
partial sum \(N\). Then the function will be called again with \(N -
1\). If \(N - 1 > 1\) then again we'll take the second branch and the
partial sum will be \(N - 1\). Once we've gotten to \(N = 1\) the
first branch will be taken, the partial sum will \(1\), and no more
calls to `arithmetic_sum` will happen. Thus all of the partial sums
will resolve back up until the first call to `arithmetic_sum` with
\(N\), creating a final sum of:

$$
N + (N - 1) + (N - 2) + ... + 2 + 1
$$

Let's take a simple example of \(N = 3\). We'll just write out the
function calls, avoiding all of the branching logic since we can do
that ourselves. The top-level call will have \(N = 3\) thus we'll take
the second branch. Let's hold on to the sum at step \(i\) as we go:

$$
sum_1 = 3 + sum_2
$$

Now we call `arithmetic_sum` with \(N = 2\). Again we take the second
branch and keep track of our sums:

$$
\begin{align*}
sum_1 &= 3 + sum_2\\
sum_2 &= 2 + sum_1
\end{align*}
$$

Now we call `arithmetic_sum` with \(N = 1\). This time we take the
first branch and as always keep track of our sums:

$$
\begin{align*}
sum_1 &= 3 + sum_2\\
sum_2 &= 2 + sum_3\\
sum_3 &= 1
\end{align*}
$$

Now we can just simplify this down:

$$
\begin{align*}
sum_1 &= 3 + sum_2\\
&= 3 + 2 + sum_3\\
&= 3 + 2 + 1\\
&= 6\\
\end{align*}
$$

This is called recursion because of the second branch calls the
function that is already executing. The function calls
"recurse". While this is a very common example of recursion, it's
actually pretty silly because no one would ever compute an arithmetic
sum this way. We'd just use the formula \(N * (N + 1) / 2\). But!
Recursion does come up a lot in *real*
programming. [Tree traversal](/simulator/home?program=tree.c) being a
very common case.

### Why is Recursion Special?

We still haven't' answered why there are sections of courses dedicated
to recursion. What you've not been told, probably, is that recursion
is special because it represents one of the two types of ways
functions call each other. All function calls look like either:

1. Function A calls function B calls function C, etc.
1. Function A eventually calls function A

In other words, functions either never call themselves (non-recursion)
or they eventually call themselves (recursion).

To motivate why recursion *is* special, let's consider the
[symbol table]({{< iref "cish-grammar.md#symbol-table" >}}) our
compiler uses to keep track of symbols. Recall that each symbol is
scoped to the block that declares the symbol. So if you have a program
like this:

```c
int foo(int N) {
  int N2 = N * 2;
  return N2;
}

int main() {
  foo(2);
}
```

Our compiler would produce a symbol table like this:

| Symbol | Address |
|-------------|---------|
| 6c78d97a-1f22-4456-82c8-2d060b20900c:`N` | 0x100        |
| da238183-cda2-4ac7-a140-9f2ab6a1fe47:`N2` | 0x101        |

Let's consider what happens in a recursive function call, using the
beloved arithmetic sum:

```c
int arithmetic_sum(int N) {
  if (N == 1) {
    return 1;
  } else {
    return N + arithmetic_sum(N - 1);
  }
}

int main() {
  int a = arithmetic_sum(2);
}
```

Put yourself in the compiler's shoes and construct your symbol table
for this program. It should look something like this:

| Symbol | Address |
|-------------|---------|
| ba5827db-646f-4836-b906-2f83a8b2277a:`N` | 0x100 |
| ca45cbb0-4894-4d96-bcb1-cd87e096b607:`a` | 0x101 |

Now trace out the execution of this program. The initial call to
`arithmetic_sum` will set the symbol `N` to the value `2`. The second
branch will be taken and you will probably evaluate the function call
first. That would avoid you having to store `N` into a register or
something like that. So you continue to call `arithmetic_sum` again,
this time setting the symbol `N` to `1`. The first branch is taken,
returning a `1` and now you can add that result to `N`. This isn't the
easiest way to understand the execution of this program, so let's
rewrite this in a pseudocode way, without function calls:

```c
// int a = arithmetic_sum(2);

  // First, compute the arithmetic_sum(2), then assign to a.
  Set N = 2;

  // N != 1, so take the second branch

  // Compute N + arithmetic_sum(N - 1) by first computing
  // arithmetic_sum(N - 1) and then adding N
    Set N = 1;

    // N == 1, so take the first branch
    Set return = 1;
  Set return = N + return;

Set a = return;
```

The pseudocode above is indented to show the different function
calls. Hopefully it's clearer. The problem is that we've overwritten
the value of `N` in the nested call to `arithmetic_sum(1)`. This
happens because the compiler doesn't know at compile-time the order of
execution. It can understand that there is a block for the
`arithmetic_sum` function, but it cannot in all cases know that
`arithmetic_sum` will be called zero, one, or an infinite number of
times.

The point is that if there are ever recursive function calls then we
cannot rely on the compiler's symbol table to solely keep track of
memory locations. We need something that can operate at **runtime**.

This is why recursion is special. It is only possible to know in all
cases whether any program has recursion in it **at runtime**. Don't
believe me? Check out
[the halting problem](https://en.wikipedia.org/wiki/Halting_problem)
and potentially answer another burning question you've had: why does
anyone care about the halting problem in real life?

## Supporting Recursion

We cannot support recursion through the compiler's symbol table
alone. We need something that keeps track of symbols at runtime. And
now we introduce another Computer Science concept that seems overly
pedagogical in the moment: the **execution stack**.

There are myriad ways to talk about the execution stack. It comes up
in a few other places, but handling recursion in a compiler is a very
clear case for why the execution stack is important. For now, we are
just going to call the execution stack: the stack.

Let's take a step back. We saw in the previous section that the
compiler's symbol table alone is not enough to support recursion. We
need a runtime "table" of symbols. Let's imagine our computer (not our
compiler) is executing a program that has a recursive function call:

```c
int arithmetic_sum(int N) {
  if (N == 1) {
    return 1;
  } else {
    return N + arithmetic_sum(N - 1);
  }
}
```

Right before we recurse into that `arithmetic_sum(N - 1)` call, we'd
ideally like to save the state of the current function call. What is
the state? It's everything the current function call has access
to. I.e. it's all of the symbols that were declared in the current
function's block scope. If we look at the weird pseudocode from
before, we want to save the value of `N` before we perform the
`arithmetic_sum(N - 1)` call:

```c
// ADDED: Set X to be memory address 0xffff
Set X = 0xffff;

// int a = arithmetic_sum(2);

  // First, compute the arithmetic_sum(2), then assign to a.
  Set N = 2;

  // N != 1, so take the second branch

  // Compute N + arithmetic_sum(N - 1) by first computing
  // arithmetic_sum(N - 1) and then adding N

  // ADDED: Save the current set of symbols.
  Store N into memory at address X;
  Set X = 0xfffe;  // X = X - 1

  // Call arithmetic_sum(N - 1)
    Set N = 1;

    // N == 1, so take the first branch
    Set return = 1;

  // ADDED: Restore the value of N from X.
  Set X = 0xffff; // X = X + 1
  Set N = Value at memory address X;

  Set return = N + return;

Set a = return;
```

What we've done here is added a special region of memory starting at
`0xffff` that the computer (not the compiler) will use to store
symbols at runtime. Before we call a new function, in this case
`arithmetic_sum`, we store all of the current function's declared
symbols into that special region of memory. Then after the function
call finishes, we restore the symbols from that special region of
memory.

The only weirdness you may have spotted is that we've started at a
very high memory address (`0xffff`) and we've decremented that address
*after* each storage operation and incremented that address *before*
each restore operation. We could certainly do this the other way
around, starting from a low address and counting upwards. The reason
we start at a high address and count downward is to avoid colliding
with other memory operations that start at lower addresses and count
upwards. But the choice of whether this special symbol table counts
down and other memory operations count up, versus the other way
around, is arbitrary.

## Stack 'Em Up

The idea of designating a specific part of memory to hold function
symbols temporarily right before a function call, and then restore
those same symbols after the call finishes smells like a very standard
Computer Science data structure. That data structure is called a
**stack**.

A stack is just a container of data that has the specific property of
"Last In, First Out" (LIFO). This may seem like an odd restriction at
first. Surely it's more general to just have a continer of data that
allows *any* entry to be retrieved or inserted. And yes, that is more
general. But also less efficient! The LIFO container is *extremely*
performant because we know a priori exactly which element will be
returned next, and where exactly the next insertion will go. That
means we can have a single read/write "head" that only ever moves by
exactly one unit, either up or down:

![Stack operations showing stack pointer going up by one](/img/recursion/4x/stack-operations@4x.png)
{class="padded-white center"}

In a computer we call this single read/write "head" a **stack
pointer**. The stack pointer points to the current "top" of the stack,
which is a memory address. So, the stack pointer is a memory address
that only ever needs to be incremented or decremented by one.

Stacks aren't useful for everything. They are specfically useful in
the case of recursion because we can guarantee *blanaced* stack
operations. In this case there are only two operations:

1. Insert a new item into the stack and increment the read/write head by one
1. Retrieve the top item from the stack and decrement the read/write head by one

As along as we can guarantee that these two operations happen in equal
amounts we are good. This property is explored more in the
[post dedicated to the stack pointer]({{< iref "stack-pointer.md" >}})
if you're interested.

## Let's Get Real

Ok, let's start talking in real life terms now. We've motivated why
recursion is important, we've talked about how to support it, and gone
over the data structure we need (a stack) to support it.

To progress, let's first look at how memory is laid out in [Cish]({{<
iref "c-compiler-intro.md" >}}):

![Memory layout](/img/recursion/4x/memory-layout@4x.png)
{class="padded-white center small"}

> Notably, we're not talking too much about the actual computer
here. We're talking about the *compiler*'s decisions. Some of those
decisions are motivated by how the hardware is built (e.g. the
[stack pointer]({{< iref "stack-pointer.md" >}})), but none of the
following is strictly specific to the Theoputer.

The "Execution Stack" is the stack we've been discussing! In Cish,
this stack starts at address `0xff40` and moves downward. Again, this
is arbitrary. It could easily start at a low address and move upward.

To support recursion in Cish, before every function call we do the
following:

1. Determine all symbols in the current scope and their memory locations (known at compile time)
1. Push all symbols from previous step onto the stack
1. Perform the function call
1. Extract function call return
1. Pop all symbols from the stack, placing each one back at the memory location it was originally located

Note that we're using the term push/pop, which is the standard jargon
terms for write/read. Note also that after every push/write, we
actually *decrement* the stack pointer and before every read we
*increment* the stack pointer because we are starting at high memory
addresses and movign down.

There are some details to (3) and (4) that are better covered by the
post on [functions]({{< iref "functions.md" >}}). For our purposes
here, we can understand the steps above as:

![Stack state and operations before and after a function call](/img/recursion/4x/function-call@4x.png)
{class="padded-white center"}

There are other uses of the stack during function calls and even in
other operations, but again they are beyond the scope of discussing
recursion.

### Connecting Back to the Compiler

The last *real* bit worth covering is how the stack operations
depicted above are actually handled by the compiler. When we looked at
how function calls are understood in the [Cish grammar]({{< iref
"cish-grammar.md#function-calls" >}}), we saw that they are a type of
expression:

```antlr
expr
    : '(' SPC* expr SPC* ')'                     #OrderedExpression

    | expr unary_postfix_op                      #UnaryPostfixOperation
    | expr SPC* '(' SPC* arg_list? SPC* ')'      #FunctionCall
    ...
```

Effectively anytime there's an expression (oh, look, recursion in the
grammar! GASP) following by parentheses, you've got a function
call. When a program is parsed and the parser encounters such a
situation, ANTLR will invoke the visitor associated with expressions
and annotate the context with the `FunctionCall` type as denoted above
(if this is foreign speak to you, check out the
[Cish grammar post]({{< iref "cish-grammar.md" >}})).

The Cish compiler is written in Typescript, and this is the code that
handles that `FunctionCall` case, with only the relevant lines shown
for simplicity:

```typescript
visitExpr(context: Parser.ExprContext, leftType: boolean = false): ExpressionResult {
  ...
  if (context instanceof Parser.FunctionCallContext) {
    ...
    // Push any "local" variables that were allocated to the
    // data heap in the current block to the stack. This is to
    // ensure recursive calls to functions can access their
    // own local variables, while still using the data heap as
    // the location where the function data is stored during
    // execution.
    //
    // Note: We intentionally do NOT want to save the global scoped
    // variables.
    const blocks = this.blockIdStack.filter(b => b != this.globalBlockId);

    const localSymbols = this.ramSymbolTable.lookupBlocks(blocks)
    contents += `;; Save local frame (${blocks})\n`
    for (let symbol of localSymbols) {
      const byteLength = getTypeLengthInBytes(symbol.type)
      const startAddress = symbol.ramLocation
      contents += `;; Save ${symbol.name}\n`
      for (let i = byteLength - 1; i >= 0; i--) {
        const address = startAddress + i
        contents += `  LAM 0x${address.toString(16)}\n`
        contents += this.generatePushAToStack()
      }
    }
  }
  ...
}
```

The last point to notice is the implementation above uses a function
`generatePushAToStack()`. In early versions of the Theoputer
*hardware*, there was not a dedicated [stack pointer]({{< iref
"stack-pointer.md" >}}). That meant that there was a fairly complex
implementation for the increment and decrement operations that go
hand-in-hand with the push/pop operations. Especially since RAM is
16-bit and thus those increment/decrement operations needed to work
operate on 16-bit numbers, which is a much more complex task for an
8-bit ALU.

And this is one of the reasons why we added a dedicated hardware stack
pointer to the Theoputer. The number of executed assembly
instructions, even for simple programs, decreased by ~60% as a result!
A large portion of that savings came from avoiding the expensive
additions/subtractions of 16-bit numbers in code, relying on hardware
counters instead.

## Closing Thoughts

This post is really long. So I am guilty of exactly the thing that I
always shook my fist at as a younger man: giving so much weight ot
talking about recursion. Hopefully, however, I've at least motivated
*why* it's worth spending the time to understand the implications of
recursion on computer architecture. That is not something I feel I was
given.

I will also admit that it's a little hard to write about this one
topic. Recursion and its implications span across all three domains of
the Theoputer: Electrical Engineering, Computer Engineering, and
Computer Science. Well, Electrical Engineering only mildly in the
choice of the stack pointer counters, but still. It's certainly spans
across all of the Computer Science areas, implicating the compiler,
the ISA, and the heretofore-no-mentioned [operating system]({{< iref
"os-beginnings.md" >}}).
