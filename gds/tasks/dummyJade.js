var plugins = module.parent.exports.plugins;

module.exports = {

  name: 'dummy-jade',
  description: ['dummy task for compile jade files'],

  starts: function() {
    return ['refresh'];
  },

  f: function() {
    plugins.devel.current('dummy-jade');
    var data = plugins.dummy.get();

    if (plugins.options.get('clear')) {
      plugins.devel.notice('clear all html files');
      var sitesFiles = plugins.scan.dir('dummy/sites', true);

      plugins.scan.walkFile(sitesFiles, function(file, path) {
        if (file.info.extend && file.info.extend == 'html' && file.info.name != 'index') {
          plugins.fs.unlinkSync('./' + path + '/' + file.name);
        }
      });
    }

    for (var site in data.sites) {
      plugins.devel.log('processing: ' + site);

      var gdata = plugins.gulp.src('gulp/jade/root.jade')
        .pipe(plugins.plumber(function(site) {
          return function(e) {
            plugins.devel.scope('dummy-jade');
            console.log();
            plugins.devel.error(e.name + ' while compile "' + site + '"');
            if (plugins.options.get('note') > 0 || plugins.options.get('debug')) {
              console.log(e._messageWithDetails());
            }
            plugins.devel.debug(e.stack, 'estack');
            console.log();
            plugins.devel.scope();
          };
        }(site)))
        .pipe(plugins.insert.prepend(plugins.dummy.insertData(data, site)));
      gdata.setMaxListeners(0);
      if (plugins.options.get('debug-file') === true || plugins.options.get('debug-file') === site) {
        gdata.pipe(plugins.intercept(function(file) {
          console.log('FILE: \n' + file.path);
          console.log('OLD CONTENT: \n' + file.contents.toString());
          return file;
        }));
      }
      gdata.pipe(plugins.jade())
        .pipe(plugins.rename(function(site) {
          return function(path) {
            path.basename = site;
          };
        }(site)))
        .pipe(plugins.gulp.dest('dummy/sites'));
    }
  },

  options: {
    'scan-scripts': ['boolean - refresh scripts scanning', ['(default: true)']],
    'scan-includes': ['boolean - refresh includes scanning', ['(default: true)']],
    'clear': ['boolean - delete all html files in sites before run the task', ['(default: true)']]
  },

  def: function() {
    return {
      'scan-includes': true,
      'scan-scripts': true,
      'clear': true,
    };
  },

};