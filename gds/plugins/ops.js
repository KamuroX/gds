module.parent.plugins.ops = {

  dependencies: function() {
    return [
      'jsons',
      'scan',
      'tasks',
      'devel',
    ];
  },

  init: function() {
    Jsons.init();
    var input = copyObject(argv);
    var local = {};
    var def = {};

    delete input['_'];
    delete input['$0'];

    if (Jsons.local.exist) {
      local = Jsons.local.data.options;
    }

    for (var task in Tasks.tasks) {
      def[task] = Tasks.tasks[task].def();
    }

    for (var task in def) {
      for (var op in def[task]) {
        this.options[task + '-' + op] = Scan.input(def[task][op]);
      }
    }
    for (var global in Tasks.globals) {
      this.options[global] = Tasks.globals[global].def;
    }
    for (var task in local) {
      if (isObject(local[task])) {
        for (var op in local[task]) {
          this.options['local-' + task + '-' + op] = Scan.input(local[task][op]);
        }
      } else {
        this.options['local-' + task] = Scan.input(local[task]);
      }
    }
    for (var op in input) {
      this.options['user-' + op] = Scan.input(input[op]);
    }

    Devel.debug(this.options, 'options');
  },

  options: {},

  searchings: function(name) {
    return [
      'user-' + Devel.current() + '-' + name,
      'user-' + name,
      'local-' + Devel.current() + '-' + name,
      'local-' + name,
      Devel.current() + '-' + name,
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

};