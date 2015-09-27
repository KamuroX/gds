module.exports = {

  init: function() {
    this.data = require('./gds.json');

    this.data.tasks = this.data.tasks || {};
    this.data.tasks.enabled = this.data.tasks.enabled || [];

    this.data.modules = this.data.modules || {};
    this.data.modules.enabled = this.data.modules.enabled || [];
  },

  registry: {},

  isDebug: false,

  data: undefined,

  out: function(output, color) {
    switch (color) {
      case 'g':
        console.log(module.parent.exports.nodes.colors.green(output));
        break;
      case 'b':
        console.log(module.parent.exports.nodes.colors.blue(output));
        break;
      case 'y':
        console.log(module.parent.exports.nodes.colors.yellow(output));
        break;
      case 'r':
        console.log(module.parent.exports.nodes.colors.red(output));
        break;
      case 'c':
        console.log(module.parent.exports.nodes.colors.cyan(output));
        break;
      default:
        console.log(output);
        break;
    }
  },

  isEnabled: function(type, name) {
    return this.isIntern(this.data[type].enabled, name);
  },

  get: function(group, object) {
    if (module.parent.exports.nodes[group] !== undefined) {
      return module.parent.exports.nodes[group][object];
    } else if (this.isDebug) {
      console.log('[FATAL] Group "' + group + '" doe\'s not exist!');
    }
  },

  add: function(key, f) {
    this.registry[key] = this.registry[key] || [];
    this.registry[key].push(f);
  },

  invoke: function(key, param) {
    var back = {};
    for (var f in (this.registry[key] || [])) {
      back = f(param, back);
    }
    return back;
  },

  isset: function(object) {
    return object !== undefined;
  },

  isArray: function(object) {
    return Object.prototype.toString.call(object) === '[object Array]';
  },

  isObject: function(object) {
    return object !== null && typeof object === 'object';
  },

  isString: function(object) {
    return typeof object === 'string';
  },

  isNumber: function(object) {
    return typeof object === 'number' && isFinite(object);
  },

  isFunction: function(object) {
    return Object.prototype.toString.call(object) == '[object Function]';
  },

  isBoolean: function(object) {
    return typeof object === 'boolean';
  },

  copy: function(object) {
    var c = undefined;

    if (this.isArray(object)) {
      c = [];
    } else if (this.isObject(object)) {
      c = {};
    }
    for (var index in object) {
      c[index] = object[index];
    }
    return c;
  },

  copyArray: function(array) {
    var newArray = [];

    for (var index in array) {
      newArray[index] = array[index];
    }
    return newArray;
  },

  copyObject: function(object) {
    var newObject = {};

    for (var field in object) {
      newObject[field] = object[field];
    }
    return newObject;
  },

  isIntern: function(object, search, strict) {
    for (var index in object) {
      if (object[index] == search && !strict || object[index] === search) {
        return true;
      }
    }
    return false;
  },

  startsWith: function(string, startsWith) {
    return string.slice(0, string.length) == startsWith;
  },

  endsWith: function(string, endsWith) {
    return string.slice(-string.length) == endsWith;
  },

  merge: function(object, merge, override) {
    for (var field in merge) {
      object[field] = override && object[field] || merge[field] || object[field];
    }
    return object;
  },

  define: function(object, def) {
    return this.isset(object) ? object : def;
  },

};