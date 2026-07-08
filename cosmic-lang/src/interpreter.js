// interpreter.js - walks the AST and executes everything

const { Environment } = require('./environment');

class Interpreter {
  constructor() {
    this.globals = new Environment();
    this.output = []; // capture all print output
  }

  run(ast) {
    this.execBlock(ast.body, this.globals);
    return this.output;
  }

  execBlock(statements, env) {
    for (let stmt of statements) {
      this.exec(stmt, env);
    }
  }

  exec(node, env) {
    switch (node.type) {
      case 'VarDeclaration': {
        let val = this.evaluate(node.value, env);
        env.define(node.name, val);
        return;
      }

      case 'Assignment': {
        let val = this.evaluate(node.value, env);
        env.set(node.name, val);
        return;
      }

      case 'PrintStatement': {
        let val = this.evaluate(node.expression, env);
        let output = (val === null || val === undefined) ? 'null' : String(val);
        this.output.push(output);
        console.log(output);
        return;
      }

      case 'IfStatement': {
        let cond = this.evaluate(node.condition, env);
        if (this.isTruthy(cond)) {
          this.exec(node.thenBranch, env);
        } else if (node.elseBranch) {
          this.exec(node.elseBranch, env);
        }
        return;
      }

      case 'WhileStatement': {
        // safety limit so we don't freeze if theres an infinite loop
        let limit = 100000;
        let count = 0;
        while (this.isTruthy(this.evaluate(node.condition, env))) {
          // create a child scope for each iteration
          let loopEnv = new Environment(env);
          this.execBlock(node.body.statements, loopEnv);
          count++;
          if (count > limit) {
            throw new Error('Infinite loop detected (exceeded 100000 iterations)');
          }
        }
        return;
      }

      case 'Block': {
        let blockEnv = new Environment(env);
        this.execBlock(node.statements, blockEnv);
        return;
      }

      default:
        // might be an expression used as a statement
        this.evaluate(node, env);
    }
  }

  evaluate(node, env) {
    switch (node.type) {
      case 'NumberLiteral':
        return node.value;

      case 'StringLiteral':
        return node.value;

      case 'BooleanLiteral':
        return node.value;

      case 'Identifier':
        return env.get(node.name);

      case 'UnaryExpr': {
        let val = this.evaluate(node.operand, env);
        if (node.operator === '-') return -val;
        if (node.operator === '!') return !this.isTruthy(val);
        throw new Error(`Unknown unary operator: ${node.operator}`);
      }

      case 'BinaryExpr': {
        let left = this.evaluate(node.left, env);
        let right = this.evaluate(node.right, env);
        return this.evalBinary(node.operator, left, right);
      }

      default:
        throw new Error(`Unknown AST node type: ${node.type}`);
    }
  }

  evalBinary(op, left, right) {
    switch (op) {
      case '+':
        // allow string concatenation
        if (typeof left === 'string' || typeof right === 'string') {
          return String(left) + String(right);
        }
        return left + right;
      case '-': return left - right;
      case '*': return left * right;
      case '/':
        if (right === 0) throw new Error('Division by zero');
        return left / right;
      case '%': return left % right;
      case '==': return left === right;
      case '!=': return left !== right;
      case '<': return left < right;
      case '>': return left > right;
      case '<=': return left <= right;
      case '>=': return left >= right;
      case '&&': return this.isTruthy(left) && this.isTruthy(right);
      case '||': return this.isTruthy(left) || this.isTruthy(right);
      default:
        throw new Error(`Unknown operator: ${op}`);
    }
  }

  // falsy: false, 0, null, undefined, empty string
  isTruthy(val) {
    if (val === false || val === 0 || val === null || val === undefined || val === '') return false;
    return true;
  }
}

module.exports = { Interpreter };
