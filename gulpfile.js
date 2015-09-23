// import dependencies

var gulp = require('gulp');
var rename = require("gulp-rename");

var jade = require('gulp-jade');

var insert = require('gulp-insert');
var replace = require('gulp-replace');

// add prototype functions

function replaceLines(gdata, placeholder, lines, rm) {
  for (var index in lines) {
    gdata.pipe(replace(new RegExp('\\n([\\s]*)\\|\\s\\~' + placeholder), '\n$1' + lines[index] + '\n$1| ~' + placeholder));
  }
  if (rm) {
    gdata.pipe(replace('| ~' + placeholder, ''));
  }
}

function loadJson(name, reload) {
  if (reload) {
    delete require.cache[require.resolve(name)];
  }
  return require(name);
}

////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////

var system = require('./gds/system');
return;
var plugins = system.plugins;
var tasks = system.tasks;
var base = system.base;

var Devel = plugins.devel;

////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////

// TODO optimize index built with invoke mixin
gulp.task('dummy-index', function() {
  Devel.current('dummy-index');
  var dummy = loadJson('./dummy/dummy.json', true);

  var prepend = '';
  var lines = [];

  prepend += '- var contentLink = ""\n';
  prepend += '- var contentTitle = ""\n';
  prepend += '- var wideClass = ""\n';
  prepend += '- var wideImage = ""\n';
  prepend += '- var mediumClass = ""\n';
  prepend += '- var mediumImage = ""\n';
  prepend += '- var narrowClass = ""\n';
  prepend += '- var narrowImage = ""\n';

  for (var name in dummy.sites) {
    Devel.log('processing: ' + name);
    dummy.sites[name].context = dummy.sites[name].context || {};
    dummy.design = dummy.design || {};
    var file = dummy.sites[name].context.file || name;
    var title = dummy.sites[name].context.title || name;
    var format = dummy.sites[name].context.format || dummy.design.format || 'jpg';

    lines.push('- contentLink = "' + file + '.html"');
    lines.push('- contentTitle = "' + title + '"');
    lines.push('- wideClass = "active"');
    lines.push('- wideImage = "../design/' + file + '-wide.' + format + '"');
    lines.push('- mediumClass = "active"');
    lines.push('- mediumImage = "../design/' + file + '-medium.' + format + '"');
    lines.push('- narrowClass = "active"');
    lines.push('- narrowImage = "../design/' + file + '-narrow.' + format + '"');
    lines.push('include index-content');
  }

  var gdata = gulp.src('dummy/design/index/index.jade')
  .pipe(insert.prepend(prepend));
  gdata.setMaxListeners(0);
  replaceLines(gdata, 'content', lines, true);
  gdata.pipe(jade()).pipe(gulp.dest('dummy/sites'));
});

////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////

console.log('START INIT');
for (var task in tasks) {
  plugins.devel.current(task);
  var starts = (base.isset(tasks[task].starts) ? tasks[task].starts() : []);

  if (starts.length) {
    plugins.gulp.task(task, starts, tasks[task].f);
  } else {
    plugins.gulp.task(task, tasks[task].f);
  }
}

if (plugins.options.get('create') >= 1) {
  plugins.gulp.start('create');
}

console.log('END INIT');
console.log();

plugins.gulp.task('test', function() {
  console.log('test');
});

plugins.gulp.task('testw', function() {
  gulp.watch('gulp/**/*.jade').on('change', function(file) {
    console.log(file);
    gulp.start('test');
  });
});