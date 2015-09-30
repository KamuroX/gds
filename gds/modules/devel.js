module.exports = {

  name: 'devel',
  description: ['provides developer functions'],
  gds: undefined,
  options: undefined,

  boot: function(gds) {
    this.gds = gds;
    this.options = gds.get('modules', 'options');
    gds.checkDepend(this.name, 'modules', ['options']);
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

  info: function(type) {
    if (type) {
      return '[' + type.toUpperCase() + '->' + this.gds.current().toUpperCase() + ']';
    }
    return '[' + this.gds.current().toUpperCase() + ']';
  },

  logs: function(object, depth, force) {
    if ((this.options && this.options.get('note') === false) && !force && !this.gds.isDebug) return;
    depth = depth || '';

    if (this.gds.isArray(object)) {
      for (var index in object) {
        this.logs(object[index], depth + '  ');
      }
    } else if (this.gds.isString(object)) {
      console.log(depth + object);
    }
  },

  log: function(string) {
    if ((this.options && this.options.get('note') !== 0) || this.gds.isDebug) {
      console.log(this.getCurrent(), string);
    }
  },

  notice: function(string) {
    if ((this.options && this.options.get('note') > 2) || this.gds.isDebug) {
      this.gds.out(this.info('notice'), 'b', string);
    }
  },

  warn: function(string) {
    if ((this.options && this.options.get('note') > 1) || this.gds.isDebug) {
      this.gds.out(this.info('warn'), 'y', string);
    }
  },

  error: function(string) {
    if ((this.options && this.options.get('note') > 0) || this.gds.isDebug) {
      this.gds.out(this.info('error'), 'r', string);
    }
  },

};