// parser.js - recursive descent parser, turns tokens into an AST

const { TokenType } = require('./lexer');

// AST node types
class Program {
  constructor(body) { this.type = 'Program'; this.body = body; }
}

class VarDeclaration {
  constructor(name, value) { this.type = 'VarDeclaration'; this.name = name; this.value = value; }
}

class Assignment {
  constructor(name, value) { this.type = 'Assignment'; this.name = name; this.value = value; }
}

class IfStatement {
  constructor(condition, thenBranch, elseBranch) {
    this.type = 'IfStatement';
    this.condition = condition;
    this.thenBranch = thenBranch;
    this.elseBranch = elseBranch;
  }
}

class WhileStatement {
  constructor(condition, body) { this.type = 'WhileStatement'; this.condition = condition; this.body = body; }
}

class PrintStatement {
  constructor(expression) { this.type = 'PrintStatement'; this.expression = expression; }
}

class Block {
  constructor(statements) { this.type = 'Block'; this.statements = statements; }
}

class BinaryExpr {
  constructor(left, operator, right) {
    this.type = 'BinaryExpr';
    this.left = left;
    this.operator = operator;
    this.right = right;
  }
}

class UnaryExpr {
  constructor(operator, operand) { this.type = 'UnaryExpr'; this.operator = operator; this.operand = operand; }
}

class NumberLiteral {
  constructor(value) { this.type = 'NumberLiteral'; this.value = value; }
}

class StringLiteral {
  constructor(value) { this.type = 'StringLiteral'; this.value = value; }
}

class BooleanLiteral {
  constructor(value) { this.type = 'BooleanLiteral'; this.value = value; }
}

class Identifier {
  constructor(name) { this.type = 'Identifier'; this.name = name; }
}


class Parser {
  constructor(tokens) {
    this.tokens = tokens;
    this.current = 0;
  }

  // helper - get current token without consuming
  peek() {
    return this.tokens[this.current];
  }

  // consume current token and move forward
  advance() {
    let tok = this.tokens[this.current];
    this.current++;
    return tok;
  }

  // check if current token matches a type
  check(type) {
    if (this.isAtEnd()) return false;
    return this.peek().type === type;
  }

  isAtEnd() {
    return this.peek().type === TokenType.EOF;
  }

  // consume if matching, otherwise throw
  expect(type, msg) {
    if (this.check(type)) return this.advance();
    let tok = this.peek();
    throw new Error(`[Line ${tok.line}] ${msg}, got '${tok.value}'`);
  }

  // try to match one of the given types
  match(...types) {
    for (let t of types) {
      if (this.check(t)) {
        this.advance();
        return true;
      }
    }
    return false;
  }

  // entry point
  parse() {
    let statements = [];
    while (!this.isAtEnd()) {
      statements.push(this.parseStatement());
    }
    return new Program(statements);
  }

  parseStatement() {
    if (this.check(TokenType.LET)) return this.parseVarDeclaration();
    if (this.check(TokenType.IF)) return this.parseIfStatement();
    if (this.check(TokenType.WHILE)) return this.parseWhileStatement();
    if (this.check(TokenType.PRINT)) return this.parsePrintStatement();
    if (this.check(TokenType.LBRACE)) return this.parseBlock();

    // could be an assignment like: x = 5;
    if (this.check(TokenType.IDENTIFIER) && this.tokens[this.current + 1]?.type === TokenType.ASSIGN) {
      return this.parseAssignment();
    }

    // fallback - expression statement
    let expr = this.parseExpression();
    this.expect(TokenType.SEMICOLON, 'Expected ";" after expression');
    return expr;
  }

  // let x = 10;
  parseVarDeclaration() {
    this.advance(); // eat 'let'
    let name = this.expect(TokenType.IDENTIFIER, 'Expected variable name after "let"').value;
    this.expect(TokenType.ASSIGN, 'Expected "=" in variable declaration');
    let value = this.parseExpression();
    this.expect(TokenType.SEMICOLON, 'Expected ";" after variable declaration');
    return new VarDeclaration(name, value);
  }

  // x = newValue;
  parseAssignment() {
    let name = this.advance().value;
    this.advance(); // eat '='
    let value = this.parseExpression();
    this.expect(TokenType.SEMICOLON, 'Expected ";" after assignment');
    return new Assignment(name, value);
  }

  // if (cond) { ... } else { ... }
  parseIfStatement() {
    this.advance(); // eat 'if'
    this.expect(TokenType.LPAREN, 'Expected "(" after "if"');
    let condition = this.parseExpression();
    this.expect(TokenType.RPAREN, 'Expected ")" after if condition');
    let thenBranch = this.parseBlock();
    let elseBranch = null;
    if (this.match(TokenType.ELSE)) {
      // allow chained else-if
      if (this.check(TokenType.IF)) {
        elseBranch = this.parseIfStatement();
      } else {
        elseBranch = this.parseBlock();
      }
    }
    return new IfStatement(condition, thenBranch, elseBranch);
  }

  // while (cond) { ... }
  parseWhileStatement() {
    this.advance(); // eat 'while'
    this.expect(TokenType.LPAREN, 'Expected "(" after "while"');
    let condition = this.parseExpression();
    this.expect(TokenType.RPAREN, 'Expected ")" after while condition');
    let body = this.parseBlock();
    return new WhileStatement(condition, body);
  }

  // print(expr);
  parsePrintStatement() {
    this.advance(); // eat 'print'
    this.expect(TokenType.LPAREN, 'Expected "(" after "print"');
    let expr = this.parseExpression();
    this.expect(TokenType.RPAREN, 'Expected ")" after print argument');
    this.expect(TokenType.SEMICOLON, 'Expected ";" after print statement');
    return new PrintStatement(expr);
  }

  // { statement; statement; ... }
  parseBlock() {
    this.expect(TokenType.LBRACE, 'Expected "{"');
    let stmts = [];
    while (!this.check(TokenType.RBRACE) && !this.isAtEnd()) {
      stmts.push(this.parseStatement());
    }
    this.expect(TokenType.RBRACE, 'Expected "}"');
    return new Block(stmts);
  }

  // expression parsing using precedence climbing
  parseExpression() {
    return this.parseOr();
  }

  parseOr() {
    let left = this.parseAnd();
    while (this.check(TokenType.OR)) {
      let op = this.advance().value;
      let right = this.parseAnd();
      left = new BinaryExpr(left, op, right);
    }
    return left;
  }

  parseAnd() {
    let left = this.parseEquality();
    while (this.check(TokenType.AND)) {
      let op = this.advance().value;
      let right = this.parseEquality();
      left = new BinaryExpr(left, op, right);
    }
    return left;
  }

  parseEquality() {
    let left = this.parseComparison();
    while (this.check(TokenType.EQ) || this.check(TokenType.NEQ)) {
      let op = this.advance().value;
      let right = this.parseComparison();
      left = new BinaryExpr(left, op, right);
    }
    return left;
  }

  parseComparison() {
    let left = this.parseAddition();
    while (this.check(TokenType.LT) || this.check(TokenType.GT) ||
           this.check(TokenType.LTE) || this.check(TokenType.GTE)) {
      let op = this.advance().value;
      let right = this.parseAddition();
      left = new BinaryExpr(left, op, right);
    }
    return left;
  }

  parseAddition() {
    let left = this.parseMultiplication();
    while (this.check(TokenType.PLUS) || this.check(TokenType.MINUS)) {
      let op = this.advance().value;
      let right = this.parseMultiplication();
      left = new BinaryExpr(left, op, right);
    }
    return left;
  }

  parseMultiplication() {
    let left = this.parseUnary();
    while (this.check(TokenType.STAR) || this.check(TokenType.SLASH) || this.check(TokenType.MODULO)) {
      let op = this.advance().value;
      let right = this.parseUnary();
      left = new BinaryExpr(left, op, right);
    }
    return left;
  }

  parseUnary() {
    if (this.check(TokenType.MINUS) || this.check(TokenType.NOT)) {
      let op = this.advance().value;
      let operand = this.parseUnary();
      return new UnaryExpr(op, operand);
    }
    return this.parsePrimary();
  }

  parsePrimary() {
    let tok = this.peek();

    if (this.check(TokenType.NUMBER)) {
      this.advance();
      return new NumberLiteral(tok.value);
    }

    if (this.check(TokenType.STRING)) {
      this.advance();
      return new StringLiteral(tok.value);
    }

    if (this.check(TokenType.TRUE)) {
      this.advance();
      return new BooleanLiteral(true);
    }

    if (this.check(TokenType.FALSE)) {
      this.advance();
      return new BooleanLiteral(false);
    }

    if (this.check(TokenType.IDENTIFIER)) {
      this.advance();
      return new Identifier(tok.value);
    }

    // grouped expression
    if (this.check(TokenType.LPAREN)) {
      this.advance();
      let expr = this.parseExpression();
      this.expect(TokenType.RPAREN, 'Expected ")" after expression');
      return expr;
    }

    throw new Error(`[Line ${tok.line}] Unexpected token: '${tok.value}'`);
  }
}

module.exports = { Parser };
