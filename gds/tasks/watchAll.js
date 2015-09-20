var plugins = module.parent.exports.plugins;

module.exports = {

  name: 'watch-all',
  description: ['watch and compile all files'],

  starts: function() {
    return ['dummy-jade', 'dummy-index', 'styles', 'jade'];
  },

  f: function() {
    plugins.devel.current('watch-all');
    var jsonTasks = [];
    if (plugins.options.get('create') == 2) {
      jsonTasks.push('create');
    }
    jsonTasks.push('dummy-index');
    jsonTasks.push('dummy-jade');

    plugins.gulp.watch('gulp/sass/*.+(scss|sass)', ['styles']);
    plugins.gulp.watch('dummy/dummy.json', jsonTasks);
    plugins.gulp.watch('gulp/jade/**/*.jade', ['dummy-jade', 'jade']);
  },

};