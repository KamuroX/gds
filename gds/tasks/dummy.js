var plugins = module.parent.exports.plugins;

module.exports = {

  name: 'dummy',
  description: ['watch all dummy files and compile'],

  starts: function() {
    return ['refresh', 'dummy-jade', 'dummy-index', 'styles'];
  },

  f: function() {
    plugins.devel.current('dummy');
    var jsonTasks = [];
    if (plugins.options.get('create') == 2) {
      jsonTasks.push('create');
    }
    jsonTasks.push('dummy-index');
    jsonTasks.push('dummy-jade');

    plugins.gulp.watch('gulp/jade/**/*.jade', ['dummy-jade']);
    plugins.gulp.watch('gulp/sass/*.+(scss|sass)', ['styles']);
    plugins.gulp.watch('dummy/dummy.json', jsonTasks);
  },

};