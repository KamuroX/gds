var gds = module.parent.exports.gds;
var gulp = undefined;
var plumber = undefined;
var insert = undefined;
var jade = undefined;
var rename = undefined;

module.exports = {

  init: function() {
    gulp = gds.get('nodes', 'gulp');
    plumber = gds.get('nodes', 'plumber');
    insert = gds.get('nodes', 'insert');
    jade = gds.get('nodes', 'jade');
    rename = gds.get('nodes', 'rename');
  },

  name: 'jade',
  description: ['compile drupal jade files'],

  starts: function() {
    return ['refresh'];
  },

  f: function() {
    var files = gds.invoke('drupal-jade-files', {path: 'gulp/jade'});

    for (var index in files) {
      gulp.src(files[index].aPath)
        .pipe(plumber(function(file) {
          return function(e) {
            gds.invoke('error', {e: e, task: 'jade', file: file});
          };
        })(files[index]))
        .pipe(insert.prepend(gds.invoke('drupal-jade-prepend', {file: files[index]}).output))
        .pipe(insert.append(gds.invoke('drupal-jade-append', {file: files[index]}).output))
        .pipe(jade())
        .pipe(rename(function(path) {
          path.extname = '.tpl.php';
        }))
        .pipe(gulp.dest('./templates/' + files[index].rPath));
    }
  },

};