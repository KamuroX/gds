var argv = require('yargs').argv;

var plugin = (module.parent.exports.plugins.options = {

  baseMerge: true,

  dependencies: function() {
    return [
      'tasks',
      'devel',
    ];
  },

  init: function() {
    var input = this.copy(argv);
    var local = {};
    var def = {};
    var tasks = plugin.tasks.get();

    delete input['_'];
    delete input['$0'];

    if (this.isset(module.parent.exports.jsons.local)) {
      local = module.parent.exports.jsons.local.options;
    }

    for (var task in tasks) {
      def[task] = tasks[task].def();
    }

    for (var task in def) {
      for (var op in def[task]) {
        this.options[task + '-' + op] = this.input(def[task][op]);
      }
    }
    for (var global in plugin.tasks.globals) {
      this.options[global] = plugin.tasks.globals[global].def;
    }
    for (var task in local) {
      if (this.isObject(local[task])) {
        for (var op in local[task]) {
          this.options['local-' + task + '-' + op] = this.input(local[task][op]);
        }
      } else {
        this.options['local-' + task] = this.input(local[task]);
      }
    }
    for (var op in input) {
      this.options['user-' + op] = this.input(input[op]);
    }

    this.devel.debug(this.options, 'options');
  },

  options: {},

  searchings: function(name) {
    return [
      'user-' + this.devel.current() + '-' + name,
      'user-' + name,
      'local-' + this.devel.current() + '-' + name,
      'local-' + name,
      this.devel.current() + '-' + name,
      name,
    ];
  },

  is: function(name) {
    var searching = this.searchings(name);

    for (var search in searching) {
      if (this.options[searching[search]] !== undefined) {
        return true;
      }
    }
    return false;
  },

  get: function(name) {
    var searching = this.searchings(name);

    for (var search in searching) {
      if (this.options[searching[search]] !== undefined) {
        return this.options[searching[search]];
      }
    }
    return false;
  },

  input: function(object) {
    if (this.isString(object)) {
      object = object.replace(/ +(?= )/g, '').trim().split(' ');
    }
    return object;
  },

});