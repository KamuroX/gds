var plugin = (module.parent.exports.plugins.devel = {

  baseMerge = true,

  dependencies: function() {
    return [
      'options',
      'colors',
    ];
  },

  /**
    * Log infos about the var object.
    * @param object vars - a var to log
    */
  vars: function(vars) {
    if (this.isArray(vars)) {
      console.log('array[');
      for (var index in vars) {
        console.log('  ' + index + ': ' + this.type(vars[index]));
      }
      console.log(']');
    } else if (this.isObject(vars)) {
      console.log('object {');
      for (var index in vars) {
        console.log('  ' + index + ': ' + this.type(vars[index]));
      }
      console.log('}');
    }
    console.log('[' + this.type(vars) + '] ' + vars);
  },

  /**
    * Get the type of the var as string.
    * @param object vars - the var to check
    * @return string - the type of the vars object or "unknown" (unknown != undefined)
    */
  type: function(vars) {
    if (this.isArray(vars)) {
      return 'array';
    } else if (this.isObject(vars)) {
      return 'object';
    } else if (this.isString(vars)) {
      return 'string';
    } else if (this.isNumber(vars)) {
      return 'number';
    } else if (this.isFunction(vars)) {
      return 'function';
    } else if (vars === null) {
      return 'null';
    } else if (this.isBoolean(vars)) {
      return 'boolean';
    } else if (vars === undefined) {
      return 'undefined';
    }
    return 'unknown';
  },

  varCurrent: 'init',
  varScope: undefined,

  current: function(current) {
    if (current) {
      this.varCurrent = current;
    }
    return this.varCurrent;
  },

  scope: function(scope) {
    if (!this.isset(scope)) {
      this.varCurrent = this.varScope;
      this.varScope = undefined;
    } else {
      if (!this.isset(this.varScope)) {
        this.varScope = this.varCurrent;
      }
      this.varCurrent = scope;
    }
  },

  getCurrent: function(before) {
    if (before) {
      return '[' + before.toUpperCase() + '->' + this.current().toUpperCase() + ']';
    }
    return '[' + this.current().toUpperCase() + ']';
  },

  isDebug: function(type) {
    var op = this.options.get('debug');
    return op === true || op === type;
  },

  debug: function(log, type) {
    if (this.isDebug(type)) {
      console.log('Task: ', this.current());
      console.log(log);
    }
  },

  logs: function(object, depth) {
    if (this.options.get('note') === false) return;
    depth = this.define(depth, '');

    if (this.isArray(object)) {
      for (var index in object) {
        this.logs(object[index], depth + '  ');
      }
    } else if (isString(object)) {
      console.log(depth + object);
    }
  },

  log: function(string) {
    if (this.options.get('note') !== 0 || this.options.get('debug')) {
      console.log(this.getCurrent(), string);
    }
  },

  notice: function(string) {
    if (this.options.get('note') > 2 || this.options.get('note') === false || this.options.get('debug')) {
      console.log(this.colors.cyan(this.getCurrent('notice')), string);
    }
  },

  warn: function(string) {
    if (this.options.get('note') > 1 || this.options.get('note') === false || this.options.get('debug')) {
      console.log(this.colors.yellow(this.getCurrent('warn')), string);
    }
  },

  error: function(string) {
    if (this.options.get('note') > 0 || this.options.get('note') === false || this.options.get('debug')) {
      console.log(this.colors.red(this.getCurrent('error')), string);
    }
  },

});