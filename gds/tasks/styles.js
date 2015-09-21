var plugins = module.parent.exports.plugins;

module.exports = {

  name: 'styles',
  description: ['drupal task for compile sass files'],

  starts: function() {
    return ['refresh'];
  },

  f: function() {
    plugins.devel.current('styles');
    var s = module.parent.exports.jsons.settings;

    for (var index = 0; index < s.styles.modes.length; index++) {
      plugins.devel.log('processing: ' + s.styles.modes[index]);

      plugins.gulp
        // load source files
        .src('gulp/sass/common.sass')

        // laod functions for the files
        .pipe(plugins.insert.prepend(plugins.drupal.insertStyle(s.styles.modes[index], s.styles.modes)))
        .pipe(plugins.sass())
        .pipe(plugins.autoprefixer())
        .pipe(plugins.rename(function(mode) {
          return function(path) {
            path.basename = mode;
          };
        }(s.styles.modes[index])))

        // write destination files
        .pipe(plugins.gulp.dest('styles'));
    }
  },

};