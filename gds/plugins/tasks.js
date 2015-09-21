var plugin = (module.parent.exports.plugins.tasks = {

  dependencies: function() {
    return [
      'colors',
    ];
  },

  get: function() {
    return module.parent.exports.tasks;
  },

  globals: {
    note: {
      description: ['int - show only logs about the level.', ['0 : no logs', '1 : error', '2 : warn (default)', '3 : notice']],
      def: 2,
    },
    debug: {
      description: ['boolean - show extra information while running'],
      def: false,
    },
    'debug-file': {
      description: ['boolean - show file content before jade compile for debug'],
      def: false,
    },
    version: {
      description: ['int - how save will the version compare', ['0 : no compare', '1 : structure', '2 : task (default)', '3 : functions', '4 : fix']],
      def: 2,
    },
    save: {
      description: ['int - error handling (not impliment)', ['0 : low - no error will terminate (default)', '1 : medium - errors will terminate', '2 : high - warn will terminate']],
      def: 0,
    },
    create: {
      description: ['int - if true the create task will run before start the main task', ['0 : never will run (default)', '1 : run on gulp init', '2 : run always']],
      def: 0,
    },
  },

});