var plugins = module.parent.exports.plugins;

module.exports = {

  name: 'refresh',
  description: ['refresh the json data'],

  starts: function() {
    return [];
  },

  f: function() {
    plugins.devel.current('refresh');

    if (plugins.options.is('load')) {
      var load = plugins.options.get('load');

      for (var name in load) {
        plugins.devel.log('reload "' + name + '"')
        module.parent.exports.loadJson(name);
      }
    }
  },

  options: {
    load: [
      'string[] - refresh other json.s (e.g. settings or local)',
      [
        'dummy (default) - reload the dummy json',
        'settings - reload the settings json',
        'local - reload the local json'
      ]
    ],
  },

  def: function() {
    return {
      load: 'dummy',
    };
  },

};