module.exports = {

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