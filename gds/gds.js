module.exports = {

  registry: {},
  isDebug: false,
  data: undefined,
  cache: {},
  current: 'init',

  init: function(argv) {
    this.data = require('./gds.json');

    this.data.tasks = this.data.tasks || {};
    this.data.tasks.enabled = this.data.tasks.enabled || [];

    this.data.modules = this.data.modules || {};
    this.data.modules.enabled = this.data.modules.enabled || [];

    this.isDebug = argv['debug'];
  },

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

  sysout: function(output, color) {
    if (this.isDebug) {
      this.out('[SYSTEM] ' + output, color);
    }
  },

  sortIn: function(object, sort) {
    var array = [];

    for (var i = 0; i < sort.length; i++) {
      array.push(object[sort[i]]);
    }
    return array;
  },

  sortWeight: function(array) {
    return array.sort(function(a, b) {
      var aweight = a.weight || 0;
      var bweight = b.weight || 0;

      if (aweight < bweight) return -1;
      if (aweight > bweight) return 1;
      if (aweight == bweight) return 0;
    });
  },

  searchFor: function(object, keys) {
    for (var i = 0; i < keys.length; i++) {
      if (this.isset(object[keys[i]])) return object[keys[i]];
    }
    return false;
  },

  isEnabled: function(type, name) {
    return this.isIntern(this.data[type].enabled, name);
  },

  get: function(group, object) {
    if (module.parent.exports[group] !== undefined) {
      return module.parent.exports[group][object];
    } else {
      this.sysout('[FATAL] Group "' + group + '" doe\'s not exist!', 'r');
    }
  },

  add: function(key, f, data) {
    this.registry[key] = this.registry[key] || [];
    this.registry[key].push({
      f: f,
      data: data,
    });
  },

  getCache: function(key) {
    if (this.isset(this.cache[key])) {
      return {cache: this.cache[key], key: key};
    } else {
      return false;
    }
  },

  setCache: function(key, value) {
    this.cache[key] = value;
    return {cache: value, key: key};
  },

  invoke: function(key, param, cache) {
    cache = (cache === undefined ? true : cache);
    var back = this.getCache('invoke-' + key) && cache || {};

    if (!this.isset(back.cache)) {
      this.sysout('invoke: ' + key);
      var invokes = (this.registry[key] || []);
      for (var object in invokes) {
        back = invokes[object].f(param, back, invokes[object].data);
      }
      if (cache) {
        this.setCache('invoke-' + key, back);
      }
    }
    return back.cache || back;
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