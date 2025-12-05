+++
title = 'Cish Grammar'
date = 2025-11-27T14:04:34-08:00
draft = true
+++

## Introduction

As we covered in the post introducing the [Cish Compiler]({{< iref
"c-compiler-intro.md" >}}), most (maybe all) programming languages are
defined via a grammar. The Cish language is no exception, and since I
designed it to be as close to C as possible, the grammar itself is
rather complex.

I should note that the language / grammar is not complete. I add
things as I need them or get the urge. So this post is a snapshot at
best. Nevertheless, the grammar has a lot of features of higher-level
programming languages. It supports:

- Structs
- Pointers
- Arrays
- Functions
- Function pointers
- Conditionals
- Flow control
- Unary and ternary operators

## Top-Level Rules

Recall that a grammar is separated into two kinds of rules: parser and
lexical. We will look at some top-level parser rules first. These
define programs at a very high-level.

Here are the first few parser rules:

```antlr
grammar Cish;

prog:
        global_decls*
        func_def*
        EOF
    ;

global_decls: global_decl+;
global_decl
    : SPC* func_decl SPC* EOL
    | SPC* struct_def SPC* EOL
    | SPC* assignment SPC* EOL
    ;

func_def:
    func_decl
    SPC*
    block
;

```

The root rule in Cish is called `prog` and as you can see programs are
defined by a set of global declarations (`global_decls`), followed by
a set of function definitions (`func_def`), and then the end of the
file.

> Recall that these rules can use regular expressions, so the
  `global_decls*` line means 0 or more `global_decls`.

Just like in regular C, global definitions are allowed and those
include either function *declarations*, struct definitions, and global
variable assignments. Technically in C you can also have struct
declarations (those might even be mandatory in old versions of C?) and
variable declarations, but this is C*ish* so those don't exist (yet).

We are going to ignore the global assignment rules for now, because
that rule is handled in most cases within a function block and it's
hard to talk about them without understanding functions first. That
said, *before* we talk about functions, let's go over the struct
definitions as they are much easier to understand than functions.

## Struct Definitions

A C struct is best thought of as a structured block of memory. In
other words, the struct definition tells the compiler that there will
be blocks of memory that adhere to a specific layout. Before we look
at the grammar rules, take a simple example:

```c
struct simple {
    int first;
};
```

In English, the programmer is telling the compiler that they want to
use the term `simple` to allocate and refer to blocks of memory such
that the beginning of that block of memory contains an integer called
`first`. Now this particular struct is pretty useless as-is unless the
name `simple` is more useful than the name `int`, so let's look at a
slightly more complex example:

```c
struct pair {
    int first;
    int second;
}
```

This is much more useful. There may be many places in a program where
we want to create a pair of integers. And we now have a very clean way
of doing so. We can simply tell the compiler that we want to create a
`pair` and it will know that we are asking it to create a block of
memory that holds two integers, such that the beginning of the block
contains an integer we will reference as `first` followed by a second
integer we will reference by `second`.

Put yourself in the compiler's shoes for now. You see this struct
definition for `pair`. What do you do? With the *definition* alone,
you just need to hold on to the layout and the references. This
definition doesn't allocate any memory, yet. But at a later point you
may encounter a *declaration* that instructs you to use this
*definition*. We're jumping ahead a little just to illustrate the
point. That definition will look like this:

```c
struct pair my_special_pair;
```

This is the programmer asking you (the compiler) to allocate a
`pair`. You held on to the structure of `pair` so you know that you
need to allocate two contiguous integers and make them reference-able
via `my_special_pair.first` and `my_special_pair.second`.


## Function-Like Rules

Function-related rules are... complex, to say the least. You might not
think that at first glance, certainly *I* did not appreciate their
complexity, but to support pointers, arrays, and function pointers the
rules have be a lot more flexible.

From the [top-level rules](#top-level-rules) you may have noticed that
there's not much difference between a function declaration and a
function definition. In fact, a function definition is just a
declaration with the function's body tacked on:

```antlr
func_def:
        func_decl
        SPC*
        block
    ;
```

So we can just focus on the grammar for function declarations, for
now. Here it is:

```antlr
func_decl
    : return_type SPC* func_decl_sans_return    #FunctionReturnsVariable
    | typename SPC*
        '(' SPC* ASTERISK SPC* func_decl_sans_return SPC* ')' SPC*
        '(' SPC* func_decl_params? SPC* ')'     #FunctionReturnsFunctionPointer
    ;
```

The first rule is pretty straightforward. It's what you think of when
you think of a function signature. There is a return type followed by,
oh wait. It's followed by a function declaration without a return?
This is just to avoid repeating ourselves in the next rule, so let's
how the `func_decl_sans_return` rule as well:

```antlr
func_decl
    : return_type SPC* func_decl_sans_return    #FunctionReturnsVariable
    | typename SPC*
        '(' SPC* ASTERISK SPC* func_decl_sans_return SPC* ')' SPC*
        '(' SPC* func_decl_params? SPC* ')'     #FunctionReturnsFunctionPointer
    ;

func_decl_sans_return: func_name SPC* '(' SPC* func_decl_params? SPC* ')';
```

Ok that's hopefully better. The first rule in the `func_decl` rules is
the normal function declaration: a return type, the name of the
function, and then a list of the function parameters (if there are
parameters) surrounded by parenthesis. You make note the
`#FunctionReturnsVariable` on that rule line, which is an ANTLR4
specific directive indicating to the ANTLR4 generator that we want to
capture this specific rule line in a referencable way for when we
write our actual compiler. In this specific case, recalling the
compiler is [written in Typescript]({{< iref
"c-compiler-intro.md#using-an-ast" >}}), when this rule line is the
matching line during parsing, we will be able to access/detect that
case via something like:

```typescript
getFunctionReturnType(context: Parser.Func_declContext): Type {
  if (context instanceof Parser.FunctionReturnsVariableContext) {
...
```

### Complicated Functions

The second rule in the `func_decl` is where things start to get a
little weird. As you can see from the annotation
`#FunctionReturnsFunctionPointer`, this line is intended to match
cases where a function returns a function pointer. You would be
forgiven for having never encountered some of the complicated
declarations that this can produce, such as:

```c
// Directly from the C99 spec
int (*fpfi(int (*)(long), int))(int, ...);

// Parseable by Cish
int (*signal(int a, int (*callback)(int)))(int);
```

Cish doesn't support all C features, namely variadiac functions,
unnamed function pointer parameters, and long types. But, given the
`func_decl` definition above, it does support the essence of the
complex example given in the C standard. Here's an attempt to make
that human-understandable, but honestly programs are written, or
trained to mimic, humans who write programs that other humans need to
understand. Since most humans, even pretty good C programmers, would
struggle to understand very complex function pointers return function
pointers ad inifinitum, this exercise is a bit gratuitous but it may
be interesting to you.

```c
int (*signal(int a, int (*callback)(int)))(int);
```

This will be parsed so that the piece `signal(...)` in those second
pair of parenthesis will end up in the `func_decl_sans_return` rule
from the `func_decl` rule:

```antlr
func_decl
    : return_type SPC* func_decl_sans_return    #FunctionReturnsVariable
    | typename SPC*
        '(' SPC* ASTERISK SPC* func_decl_sans_return SPC* ')' SPC*
        '(' SPC* func_decl_params? SPC* ')'     #FunctionReturnsFunctionPointer
    ;
```

You can see this handled in the compiler code:

```typescript
  getFunctionParameters(declaration: Parser.Func_declContext): Parser.Func_decl_paramContext[] {
    ...
    } else if (declaration instanceof Parser.FunctionReturnsFunctionPointerContext) {
      return declaration.func_decl_sans_return().func_decl_params()?.func_decl_param() ?? []
    }
    ...
  }
```

In essence, while parsing, we can just focus on parantheses
pairings. This is very similar to the
["spiral rule"](https://c-faq.com/decl/spiral.anderson.html) for
reading C pointers and the method outlined by
[Eric Giguere](https://www.ericgiguere.com/articles/reading-c-declarations.html),
if you're deeply interested. Continuing to the next set of
paranthesis:

```c
int (*signal(...))(int);
```

> Note: I'm not convinced that my grammar handles all of the C cases
  perfectly. It handles all of the cases I've found so far, but
  translating the grammar and compiler out of the actual C standard or
  the techniques above was very complicated, so when I got to a point
  where all of my examples parsed correctly, I stopped.

We know this function `signal` returns a pointer to a function. Let's
call this return function `foo` -- that's made up. What does the
declaration of `foo` look like? Well, according to the C spec (not a
recommended read) we need to enforce that `foo` looks like:

```c
int foo(int);
```

This is handled/enforced by the compiler when the compiler is
determining the return type of a declared function:

```typescript
  getFunctionReturnType(context: Parser.Func_declContext): Type {
    ...
    } else if (context instanceof Parser.FunctionReturnsFunctionPointerContext) {
      const functionType = this.getFunctionTypeFromFunctionPointer(
        context.typename(), context.func_decl_params())
      const pointedToType = functionType
      return makeConcreteType(ConcreteTypes.POINTER, pointedToType)
   ...
 }
```

Now let's handle the rest of the crap that's elided with the ellipsis
above:

```c
// We handled this:
int (*signal(...))(int);

// Now let's look at the stuff inside the ellipsis:
signal(int a, int (*callback)(int))
```

That's more manageable. This function `signal` that returns the
function pointer takes two arguments. The first is an integer that
will be accessible via the name `a`. The second... ugh. The second
looks complicated, because it is. This thing has the telltale sign
that it is a function pointer. So we have to do the parenthesis trick
again:

```c
int (*callback)(...)
```

This is a function pointer that points to a function returning an
integer. The arguments to this function pointer are in the ellipsis:

```c
callback(int)
```

Ok. So `signal` takes two arguments. The first is an integer `a` and
the second is a function pointer `callback` that points to a function
taking an integer as an argument and returning an integer.

No we put it ALL together. `signal` is a function. It returns a
pointer to a function that will take an integer and return an
integer. `signal` takes two arguments. The first is an integer
reference-able by `a` and the second is a pointer to a function
reference-able by `callback`, where `callback` points to a function
that takes an integer and returns an integer.

If you want to see how this actually works, you can check out a
program that uses [this example in the simulator](https://theoputer.sarietta.com/simulator/home?program=function-pointers-complex.c).

> Hint: Click the Show AST button on the simulator to see the AST.

## Statements

Programs written in C(ish) are imperative. That is a fancy way of
saying that a Cish program is just a sequence of operations that get
carried out step-by-step. Sure, some of those steps may cause the
executed line to jump around, but nevertheless, the programs are
defined in a step-by-step fashion. If you're curious, the other type
of language is a declarative language, but we are going to ignore its
existence.

So far we've looked at global rules and function rules. Neither of
those rules were operations save for the global-level assignments,
which we skipped because they will look exactly like a specific kind
of **statement** we are about to consider.

## Expressions

### Function Calls

## Blocks

> Note: Cish doesn't support nested blocks at the moment. This is by
  choice. In C++ nested blocks are incredibly useful for pointer
  deallocation with scoped pointers, but in C nested blocks seem a lot
  less useful to me and thus not worth the effort to get the grammar
  and compiler to handle them.

## Symbol Table

Admittedly it is hard to figure out the right moment to introduce the
symbol table. The earlier the better! Let's first discuss what a
"symbol" is and then we'll motivate why we need a table of symbols.

A symbol is just a name that programmers can use to refer to something
else. It's sort of like a person's name rather than their phone
number. It's hard to memorize phone numbers for humans, but far easier
to remember a person's name. Similarly, programming languages provide
a way for a programmer (usually a human) to associate a name with some
other piece of data/information. The simplest version of this is a
variable definition:

```c
int foo;
```

This is a far simpler way to refer to a block of memory that contains
an integer than that memory's address! But that's exactly what you
would do if you were writing in assembly:

```nasm
LAI 0x00
MCA 0x1082
```

Sure, we could try to keep track of the memory address above
(`0x1082`), but it's far easier to give this variable a meaningful
name. That helps us keep track of the variable, indicate what the
variable represents, and makes it *much* easier for other programmers
to understand this variable.

But if we aren't keeping track of the connection between `foo` and
`0x1082`, then who/what is? Well the compiler is! And it is doing so
through the use of a symbol table. A literal table that maps symbols
to their locations in memory.

So what is a symbol? It's really just a name. Nothing more complicated
than that:

```antlr
symbol_name: NAME;
...

// Lexer Rules
...
INT8_KEYWORD	 : 'int';
...
EOL: ';';
...
NAME: [A-Za-z_][A-Za-z0-9_]* ;
...
SPC: [ \t];
...
```

That's the actual grammar rule for symbols in Cish. Now, this `NAME`
is defined in the lexer rules so that special keywords are always
parsed *before* it, but as long as none of the other lexer rules
match, any string of alphanumeric characters that start with a letter
of the alphabet will be interpreted as a `NAME` and thus as a
`symbol_name`. Turning back to our simple example above:

```c
int foo;
```

This will lex into:

```
<INT8_KEYWORD><SPC><NAME><EOL>
```

We still don't know which parser rule will match this, but let's skip
that for a moment to finish out the symbol table discussion. From the
compiler's perspective we have the information we need to capture the
symbol table entry. The symbol will be `NAME` and the memory block it
will point to will be 8-bits long and contain an 8-bit integer.

### Symbol Scope

A keen eye may wonder what happens in the following situation:

```c
void function1() {
  int foo;
}

void function2() {
  int foo;
}
```

If we used the strict definition of the symbol table from before we
would have a problem differentiating the two `foo` symbols above. We
*could* enforce globally unique names. That's not great
though. Imagine your language becomes very opoular and there are
libraries, long code blocks, etc. Globally unique names would become a
hude PITA.

The solution in Cish is to use block-level scoping for symbols. We
covered [blocks](#blocks) earlier, but to reiterate, a block is any
set of statements between a `{` and a `}`. To enable the code above to
generate two distinct symbols, the Cish compiler generates UUIDs for
each block and then defines symbols as:
`${blockId}:${symbolName}`. Thus, the symbol table for the above
program would look something like:

| Symbol | Address |
|-------------|---------|
| 8e145050-cfd7-11f0-808b-1b93d0490aa6:`foo` | 0x100        |
| 982a4f86-cfd7-11f0-af61-7fec2c8f4aa5:`foo` | 0x101        |

There is a detail left out here regarding recursive function
calling. That is a large enough topic that there's an entire post
devoted to [supporting recursion]({{< iref "recursion.md" >}}) in
Cish, and in that section we handle the symbol table specifics.
