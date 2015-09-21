var plugin = (module.parent.exports.plugins.drupal = {

  dependencies: function() {
    return [
      'dummy',
    ];
  },

  insertStyle: function(mode, modes) {
    var insert = '';

    for (var index in modes) {
      insert += '$' + modes[index] + ' : ';
      if (modes[index] == mode) {
        insert += 'true';
      } else {
        insert += 'false';
      }
      insert += '\n';
    }
    insert += '@import mixins\n';
    return insert;
  },

  prependData: function() {
    var output = '';
    var vars = {
      drupal: true,
      dummy: false,
      scripts: this.dummy.scripts(module.parent.exports.jsons.dummy),
    };

    output += '- var vars = ' + JSON.stringify(vars) + ';\n';
    output += 'include ../mixins\n';
    output += 'include ../root\n\n';
    return output;
  },


  getMID: function(string) {
     return string.toLowerCase().replace(new RegExp('(\\\\s|[^a-z0-9])', 'g'), '_');
  },

  getID: function(string) {
    return string.toLowerCase().replace(new RegExp('(\\\\s|[^a-z0-9])', 'g'), '-');
  },

});