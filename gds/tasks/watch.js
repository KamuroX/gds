var plugins = module.parent.exports.plugins;

module.exports = {

  name: 'watch',
  description: ['watch and compile all drupal files'],

  starts: function() {
    return ['refresh', 'jade', 'styles'];
  },

  f: function() {
    plugins.devel.current('watch');

    gulp.watch('gulp/jade/**/*.jade', ['jade']);
    gulp.watch('gulp/sass/*.+(scss|sass)', ['styles']);
  },

};