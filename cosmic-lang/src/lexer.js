// lexer.js - breaks source code into tokens

const TokenType = {
  // literals
  NUMBER: 'NUMBER',
  STRING: 'STRING',
  IDENTIFIER: 'IDENTIFIER',

  // keywords
  LET: 'LET',
  IF: 'IF',
  ELSE: 'ELSE',
  WHILE: 'WHILE',
  TRUE: 'TRUE',
  FALSE: 'FALSE',
  AND: 'AND',
  OR: 'OR',
  PRINT: 'PRINT',

  // single char
  PLUS: 'PLUS',
  MINUS: 'MINUS',
  STAR: 'STAR',
  SLASH: 'SLASH',
  ASSIGN: 'ASSIGN',
  LPAREN: 'LPAREN',
  RPAREN: 'RPAREN',
  LBRACE: 'LBRACE',
  RBRACE: 'RBRACE',
  SEMICOLON: 'SEMICOLON',
  COMMA: 'COMMA',
  MODULO: 'MODULO',

  // comparison
  EQ: 'EQ',
  NEQ: 'NEQ',
  LT: 'LT',
  GT: 'GT',
  LTE: 'LTE',
  GTE: 'GTE',
  NOT: 'NOT',

  EOF: 'EOF'
};

// map keywords to token types
const keywords = {
  'let': TokenType.LET,
  'if': TokenType.IF,
  'else': TokenType.ELSE,
  'while': TokenType.WHILE,
  'true': TokenType.TRUE,
  'false': TokenType.FALSE,
  'and': TokenType.AND,
  'or': TokenType.OR,
  'print': TokenType.PRINT
};

class Token {
  constructor(type, value, line) {
    this.type = type;
    this.value = value;
    this.line = line;
  }
}

class Lexer {
  constructor(source) {
    this.source = source;
    this.pos = 0;
    this.line = 1;
    this.tokens = [];
  }

  peek() {
    return this.pos < this.source.length ? this.source[this.pos] : null;
  }

  advance() {
    let ch = this.source[this.pos];
    this.pos++;
    if (ch === '\n') this.line++;
    return ch;
  }

  // look ahead one more char
  peekNext() {
    return (this.pos + 1) < this.source.length ? this.source[this.pos + 1] : null;
  }

  addToken(type, value) {
    this.tokens.push(new Token(type, value, this.line));
  }

  tokenize() {
    while (this.pos < this.source.length) {
      let ch = this.peek();

      // skip whitespace
      if (ch === ' ' || ch === '\t' || ch === '\r' || ch === '\n') {
        this.advance();
        continue;
      }

      // skip single-line comments
      if (ch === '/' && this.peekNext() === '/') {
        while (this.pos < this.source.length && this.peek() !== '\n') {
          this.advance();
        }
        continue;
      }

      // numbers
      if (this.isDigit(ch)) {
        this.readNumber();
        continue;
      }

      // strings (double quotes)
      if (ch === '"') {
        this.readString();
        continue;
      }

      // identifiers and keywords
      if (this.isAlpha(ch)) {
        this.readIdentifier();
        continue;
      }

      // operators and punctuation
      switch (ch) {
        case '+': this.advance(); this.addToken(TokenType.PLUS, '+'); break;
        case '-': this.advance(); this.addToken(TokenType.MINUS, '-'); break;
        case '*': this.advance(); this.addToken(TokenType.STAR, '*'); break;
        case '/': this.advance(); this.addToken(TokenType.SLASH, '/'); break;
        case '%': this.advance(); this.addToken(TokenType.MODULO, '%'); break;
        case '(': this.advance(); this.addToken(TokenType.LPAREN, '('); break;
        case ')': this.advance(); this.addToken(TokenType.RPAREN, ')'); break;
        case '{': this.advance(); this.addToken(TokenType.LBRACE, '{'); break;
        case '}': this.advance(); this.addToken(TokenType.RBRACE, '}'); break;
        case ';': this.advance(); this.addToken(TokenType.SEMICOLON, ';'); break;
        case ',': this.advance(); this.addToken(TokenType.COMMA, ','); break;

        case '=':
          this.advance();
          if (this.peek() === '=') {
            this.advance();
            this.addToken(TokenType.EQ, '==');
          } else {
            this.addToken(TokenType.ASSIGN, '=');
          }
          break;

        case '!':
          this.advance();
          if (this.peek() === '=') {
            this.advance();
            this.addToken(TokenType.NEQ, '!=');
          } else {
            this.addToken(TokenType.NOT, '!');
          }
          break;

        case '<':
          this.advance();
          if (this.peek() === '=') {
            this.advance();
            this.addToken(TokenType.LTE, '<=');
          } else {
            this.addToken(TokenType.LT, '<');
          }
          break;

        case '>':
          this.advance();
          if (this.peek() === '=') {
            this.advance();
            this.addToken(TokenType.GTE, '>=');
          } else {
            this.addToken(TokenType.GT, '>');
          }
          break;

        case '&':
          this.advance();
          if (this.peek() === '&') {
            this.advance();
            this.addToken(TokenType.AND, '&&');
          } else {
            throw new Error(`[Line ${this.line}] Unexpected char '&', did you mean '&&'?`);
          }
          break;

        case '|':
          this.advance();
          if (this.peek() === '|') {
            this.advance();
            this.addToken(TokenType.OR, '||');
          } else {
            throw new Error(`[Line ${this.line}] Unexpected char '|', did you mean '||'?`);
          }
          break;

        default:
          throw new Error(`[Line ${this.line}] Unexpected character: '${ch}'`);
      }
    }

    this.addToken(TokenType.EOF, null);
    return this.tokens;
  }

  readNumber() {
    let start = this.pos;
    while (this.pos < this.source.length && this.isDigit(this.peek())) {
      this.advance();
    }
    // handle decimals
    if (this.peek() === '.' && this.isDigit(this.peekNext())) {
      this.advance(); // skip the dot
      while (this.pos < this.source.length && this.isDigit(this.peek())) {
        this.advance();
      }
    }
    let num = parseFloat(this.source.substring(start, this.pos));
    this.addToken(TokenType.NUMBER, num);
  }

  readString() {
    this.advance(); // skip opening quote
    let start = this.pos;
    while (this.pos < this.source.length && this.peek() !== '"') {
      if (this.peek() === '\n') this.line++;
      this.advance();
    }
    if (this.pos >= this.source.length) {
      throw new Error(`[Line ${this.line}] Unterminated string`);
    }
    let str = this.source.substring(start, this.pos);
    this.advance(); // skip closing quote
    this.addToken(TokenType.STRING, str);
  }

  readIdentifier() {
    let start = this.pos;
    while (this.pos < this.source.length && this.isAlphaNumeric(this.peek())) {
      this.advance();
    }
    let word = this.source.substring(start, this.pos);
    // check if its a keyword or just a variable name
    let type = keywords[word] || TokenType.IDENTIFIER;
    this.addToken(type, word);
  }

  isDigit(ch) { return ch >= '0' && ch <= '9'; }
  isAlpha(ch) { return (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || ch === '_'; }
  isAlphaNumeric(ch) { return this.isDigit(ch) || this.isAlpha(ch); }
}

module.exports = { Lexer, TokenType, Token };
