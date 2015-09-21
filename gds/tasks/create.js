var plugins = module.parent.exports.plugins;

module.exports = {

  name: 'create',
  description: ['scan the dummy json after templates and create them as jade files'],

  starts: function() {
    return ['refresh'];
  },

  f: function() {
    plugins.devel.current('create');

    var dummy = plugins.dummy.get();
    var includes = [];

    for (var site in dummy.sites) {
      for (var region in dummy.sites[site].regions) {
        plugins.scan.element(dummy.sites[site].regions[region], function(element) {
          includes.push(element);
        });
      }
    }

    plugins.devel.debug(includes, 'includes');

    for (var i = 0; i < includes.length; i++) {
      var parts = includes[i].split('/');
      var file = 'gulp/jade';

      for (var k = 0; k < parts.length; k++) {
        file += '/' + parts[k];
        if (k == parts.length - 1) {
          var writer = plugins.factory.writer(file + '.jade');
          var nameparts = parts[k].split('--');

          writer.line('mixin ' + parts[k]);
          writer.line('  ');
          for (var z = 0; z < nameparts.length; z++) {
            writer.append('.' + plugins.drupal.getID(nameparts[z]));
          }
          writer.line('    | auto generated ' + parts[k]);
          writer.write(true, true);
        } else {
          if (!plugins.scan.fsExist(file)) {
            plugins.devel.notice('Create directory "' + file + '"');
            plugins.fs.mkdirSync(file, function(e) {
              if (e) {
                plugins.devel.error('Don\'t can create directory "' + file + '"', 'create-dir');
              }
            });
          } else {
            plugins.devel.notice('Exist directory "' + file + '"');
          }
        }
      }
    }
  },

};