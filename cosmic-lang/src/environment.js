// environment.js - handles variable storage and scoping

class Environment {
  constructor(parent = null) {
    this.vars = {};
    this.parent = parent; // for nested scopes (inside loops, if blocks, etc)
  }

  // define a new variable in this scope
  define(name, value) {
    this.vars[name] = value;
  }

  // look up a variable, walk up scope chain if needed
  get(name) {
    if (name in this.vars) {
      return this.vars[name];
    }
    if (this.parent) {
      return this.parent.get(name);
    }
    throw new Error(`Undefined variable: '${name}'`);
  }

  // update an existing variable
  set(name, value) {
    if (name in this.vars) {
      this.vars[name] = value;
      return;
    }
    if (this.parent) {
      this.parent.set(name, value);
      return;
    }
    throw new Error(`Cannot assign to undefined variable: '${name}'`);
  }
}

module.exports = { Environment };
