var plugins = module.parent.exports.plugins;

module.exports = {

  name: 'jade',
  description: ['compile drupal jade files'],

  starts: function() {
    return ['refresh'];
  },

  f: function() {
    plugins.devel.current('jade');

    var jadeTemplates = plugins.scan.dir('gulp/jade', true);

    plugins.scan.walkFile(jadeTemplates, function(file, path) {
      if (file.info.name != 'mixins' && file.info.name != 'root' && file.info.extend == 'jade') {
        var gdata = plugins.gulp.src('.' + path + '/' + file.name)
          .pipe(plugins.plumber(function(file) {
            return function(e) {
              plugins.devel.scope('jade');
              console.log();
              plugins.devel.error(e.name + ' while compile "' + file.info.name + '"');
              if (plugins.options.get('note') > 0 || Options.get('debug')) {
                console.log(e._messageWithDetails());
              }
              plugins.devel.debug(e.stack, 'estack');
              console.log();
              plugins.devel.scope();
            };
          }(file)))
          .pipe(plugins.insert.prepend(plugins.drupal.prependData()))
          .pipe(plugins.insert.append('\n+' + file.info.name + '({})\n'));

        if (plugins.options.get('debug-file') === true || plugins.options.get('debug-file') === file.info.name) {
          gdata.pipe(plugins.intercept(function(file) {
            console.log('FILE: \n' + file.path);
            console.log('OLD CONTENT: \n' + file.contents.toString());
            return file;
          }));
        }
        gdata.pipe(plugins.jade())
          .pipe(plugins.rename(function(path) {
            path.extname = '.tpl.php';
          }))
          .pipe(plugins.gulp.dest('./templates/' + path.substring('/gulp/jade/'.length)));
      }
    });
  },

};