# CosmicScript

A custom programming language interpreter built from scratch with Node.js.

CosmicScript supports variables, arithmetic, conditionals, while loops, string concatenation, and more — all parsed and executed without any external libraries.

## How it works

The interpreter has 3 stages:

1. **Lexer** (`src/lexer.js`) — scans source code and breaks it into tokens
2. **Parser** (`src/parser.js`) — recursive descent parser that builds an Abstract Syntax Tree
3. **Interpreter** (`src/interpreter.js`) — walks the AST and executes each node

## Running a program

```bash
node index.js examples/fizzbuzz.cosmic
node index.js examples/fibonacci.cosmic
node index.js examples/primes.cosmic
```

## Language syntax

```
// variables
let x = 10;
let name = "cosmic";

// math
let result = (x + 5) * 2;

// conditions
if (x > 5) {
  print("big");
} else {
  print("small");
}

// loops
let i = 0;
while (i < 10) {
  print(i);
  i = i + 1;
}

// boolean logic
if (x > 0 && x < 100) {
  print("in range");
}

// modulo for fizzbuzz etc
if (x % 3 == 0) {
  print("divisible by 3");
}
```

## Features

- Variables with `let`
- While loops
- If/else if/else chains
- Arithmetic: `+`, `-`, `*`, `/`, `%`
- Comparison: `==`, `!=`, `<`, `>`, `<=`, `>=`
- Boolean operators: `&&`, `||`, `!`
- String literals and concatenation
- `print()` for output
- Single-line comments with `//`
- Nested scopes
- Infinite loop protection

## Tech

- Node.js (no external dependencies)
