#!/usr/bin/env node

// index.js - CLI entry point for CosmicScript
// usage: node index.js <filename.cosmic>

const fs = require('fs');
const path = require('path');
const { Lexer } = require('./src/lexer');
const { Parser } = require('./src/parser');
const { Interpreter } = require('./src/interpreter');

const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('CosmicScript v1.0');
  console.log('Usage: node index.js <file.cosmic>');
  console.log('');
  console.log('Example: node index.js examples/fizzbuzz.cosmic');
  process.exit(0);
}

const filePath = path.resolve(args[0]);

if (!fs.existsSync(filePath)) {
  console.error(`Error: File not found: ${filePath}`);
  process.exit(1);
}

const source = fs.readFileSync(filePath, 'utf-8');

try {
  // step 1: tokenize
  const lexer = new Lexer(source);
  const tokens = lexer.tokenize();

  // step 2: parse into AST
  const parser = new Parser(tokens);
  const ast = parser.parse();

  // step 3: interpret
  const interpreter = new Interpreter();
  interpreter.run(ast);

} catch (err) {
  console.error(`CosmicScript Error: ${err.message}`);
  process.exit(1);
}
