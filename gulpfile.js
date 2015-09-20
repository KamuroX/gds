var version = '1.1.1.0';
// import dependencies

var gulp = require('gulp');
var rename = require("gulp-rename");

var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var jade = require('gulp-jade');

var insert = require('gulp-insert');
var replace = require('gulp-replace');

var fs = require('fs');

var argv = require('yargs').argv;
var gutil = require('gulp-util');
var plumber = require('gulp-plumber');
var intercept = require('gulp-intercept');

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

gulp.task('dummy-debug', function() {
  console.log('Start Debug');
  console.log();
  var dumm = Dummy.get();
  var e = {
    warns: 0,
    errors: 0,
    showWarns: true,
    showErrors: true,
    region: [debugContentRegion],
  };

  debug(dumm, e, e.region);

  console.log();
  console.log('End Debug with:');
  if (e.showWarns) {
    console.log('  Warning\'s: ' + e.warns);
  }
  if (e.showErrors) {
    console.log('  Error\'s: ' + e.errors);
  }
});

// TODO make debug as object class

function debug(dummy, e, debugs) {
  for (var index in debugs) {
    debugs[index](dummy, e);
  }
}

function debugContentRegion(dummy, e) {
  for (var index in dummy.sites) {
    var site = dummy.sites[index];
    if (Scan.exist(site, ['regions', 'content'])) {

    } else {
      debugError(e, 'Site "' + index + '" have no content region!');
    }
  }
}

function debugNotice(e, message) {
  if (e.showNotice) {
    console.log('[NOTICE]: ' + message);
  }
}

function debugWarn(e, message) {
  if (e.showWarns) {
    e.warns++;
    console.log('[WARNING]: ' + message);
  }
}

function debugError(e, message) {
  if (e.showErrors) {
    e.errors++;
    console.log(gutil.colors.red('[ERROR]'), message);
  }
}

////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////

/**
  * STATIC OBJECT
  * Recursive scanning functions.
  */
var Scan = {

  /**
    * Get the mixin name from including file.
    * @param string string - a string from including file
    * @return string
    */
  include: function(string) {
    string = string.split('/');
    return string[string.length - 1];
  },

  /**
    * Run recursive through the element object and use a functions on all strings.
    * @param object element - an element to run through
    * @param callback f - a function to call for all strings
    *   - param string - the string
    */
  element: function(element, f) {
    if (isArray(element)) {
      for (var index in element) {
        this.element(element[index], f);
      }
    } else if (isObject(element)) {
      this.element(element.items, f);
    } else if (isString(element)) {
      f(element);
    }
  },

  /**
    * Run recursive through the file object and use a function for all files.
    * @param object[file] file - the file object to run through
    * @param callback f - the function to call for all files
    *   - param object[file] - the file
    */
  walkFile: function(file, f, path) {
    path = path || '';
    if (file.objType === 'file') {
      f(file, path);
      if (file.isDirectory) {
        for (var index in file.files) {
          this.walkFile(file.files[index], f, path + '/' + file.name);
        }
      }
    }
  },

  /**
    * Check if a field exist in object.
    * @param object object - the object to check
    * @param array scan - an array of fields to check recursive in object
    * @return boolean
    */
  exist: function(object, scan) {
    for (var index in scan) {
      if (object[scan[index]] !== undefined) {
        object = object[scan[index]];
      } else {
        return false;
      }
    }
    return true;
  },

  dirCache: {},

  /**
    * Built the file tree.
    * @param string root - the directory to scan
    * @param boolean flush - clear the cache
    * @return object[file] - the file object of root
    */
  dir: function(root, flush) {
    if (flush || this.dirCache[root] === undefined) {
      Devel.notice('scanning: ' + root);
      this.dirCache[root] = this.dirWalk(Factory.file(root, true), root);
    }
    return this.dirCache[root];
  },

  /**
    * Helper function for scan.dir
    * @param object[file] result - the file object to add the files
    * @param string dir - the directory or file to scan
    * @return object[file] - the file object to create
    */
  dirWalk: function(result, dir) {
    var list = fs.readdirSync(dir);

    for (var index in list) {
      var name = list[index];
      var stat = fs.statSync(dir + '/' + name);
      var directory = stat && stat.isDirectory();
      var file = result.add(Factory.file(name, directory));

      if (directory) {
        this.dirWalk(file, dir + '/' + name);
      }
    }
    return result;
  },

  input: function(object) {
    if (isString(object)) {
      object = object.replace(/ +(?= )/g, '').trim().split(' ');
    }
    return object;
  },

  fsExist: function(path, log) {
    try {
      return fs.existsSync(path);
    } catch (e) {
      if (log || Options.get('note') == 5) {
        Devel.error(e.toString());
      }
    }
    return false;
  }

};

var test = require('./gds/Plugins');

var Tasks = {

  globals: {
    note: {
      description: ['int - show only logs about the level.', ['0 : no logs', '1 : error', '2 : warn (default)', '3 : notice']],
      def: 2,
    },
    debug: {
      description: ['boolean - show extra information while running'],
      def: false,
    },
    'debug-file': {
      description: ['boolean - show file content before jade compile for debug'],
      def: false,
    },
    version: {
      description: ['int - how save will the version compare', ['0 : no compare', '1 : structure', '2 : task (default)', '3 : functions', '4 : fix']],
      def: 2,
    },
    save: {
      description: ['int - error handling ' + gutil.colors.red('(not impliment)'), ['0 : low - no error will terminate (default)', '1 : medium - errors will terminate', '2 : high - warn will terminate']],
      def: 0,
    },
    create: {
      description: ['int - if true the create task will run before start the main task', ['0 : never will run (default)', '1 : run on gulp init', '2 : run always']],
      def: 0,
    },
  },

  tasks: {
    'dummy': {

      starts: function() {
        return ['refresh', 'dummy-jade', 'dummy-index', 'styles'];
      },

      f: function() {
        Devel.current('dummy');
        var jsonTasks = [];
        if (Options.get('create') == 2) {
          jsonTasks.push('create');
        }
        jsonTasks.push('dummy-index');
        jsonTasks.push('dummy-jade');

        gulp.watch('gulp/jade/**/*.jade', ['dummy-jade']);
        gulp.watch('gulp/sass/*.+(scss|sass)', ['styles']);
        gulp.watch('dummy/dummy.json', jsonTasks);
      },

      options: {},

      def: function() {
        return {};
      },

      description: ['watch all dummy files and compile'],

    },
    refresh: {

      starts: function() {
        return [];
      },

      f: function() {
        Devel.current('refresh');

        Jsons.init();
        if (Options.is('load')) {
          var load = Options.get('load');

          for (var name in load) {
            Jsons.load(load[name]);
          }
        }
      },

      options: {
        load: ['string[] - refresh other json.s (e.g. settings or local)', ['dummy (default)', 'settings - reload the settings json', 'local - reload the local json']],
      },

      def: function() {
        return {
          load: 'dummy',
        };
      },

      description: ['refresh the json data (default: load only the dummy.json)'],

    },
    help: {

      starts: function() {
        return [];
      },

      f: function() {
        Devel.current('help');

        console.log();
        if (Options.get('g')) {
          console.log('Globals:');
          for (var option in Tasks.globals) {
            Devel.logs([gutil.colors.green(option) + ':', Tasks.globals[option].description])
          }
          console.log();
        } else if (Options.is('task')) {
          var task = Options.get('task')[0];

          if (Tasks.tasks[task] === undefined) {
            Devel.error('Task "' + task + '" don\'t exist!');
            console.log();
          } else {
            console.log('Task "' + gutil.colors.cyan(task) + '":');
            var optionsLog = [];
            for (var option in Tasks.tasks[task].options) {
              optionsLog.push(gutil.colors.green(option) + ':', Tasks.tasks[task].options[option]);
            }
            console.log();
            Devel.logs(Tasks.tasks[task].description);
            console.log();
            if (optionsLog.length) {
              Devel.logs(['Options:', optionsLog]);
              console.log();
            }
          }
        } else {
          console.log('Tasks:');
          for (var task in Tasks.tasks) {
            Devel.logs([gutil.colors.green(task) + ':', Tasks.tasks[task].description])
          }
          console.log();
        }

        if (!Options.is('task')) {
          console.log('Use ', gutil.colors.green('gulp help --task "') + gutil.colors.yellow('<task>') + gutil.colors.green('"'), 'for more infos');
          console.log();
        }
      },

      options: {
        task: ['string - the task name to get more infos'],
        g: ['boolean - infos about globals'],
      },

      def: function() {
        return {};
      },

      description: ['help function'],

    },

    'dummy-jade': {

      starts: function() {
        return ['refresh'];
      },

      f: function() {
        Devel.current('dummy-jade');
        var data = Dummy.get();

        if (Options.get('clear')) {
          Devel.notice('clear all html files');
          var sitesFiles = Scan.dir('dummy/sites', true);

          Scan.walkFile(sitesFiles, function(file, path) {
            if (file.info.extend && file.info.extend == 'html' && file.info.name != 'index') {
              fs.unlinkSync('./' + path + '/' + file.name);
            }
          });
        }

        for (var site in data.sites) {
          Devel.log('processing: ' + site);

          var gdata = gulp.src('gulp/jade/root.jade')
            .pipe(plumber(function(site) {
              return function(e) {
                Devel.scope('dummy-jade');
                console.log();
                Devel.error(e.name + ' while compile "' + site + '"');
                if (Options.get('note') > 0 || Options.get('debug')) {
                  console.log(e._messageWithDetails());
                }
                Devel.debug(e.stack, 'estack');
                console.log();
                Devel.scope();
              };
            }(site)))
            .pipe(insert.prepend(Dummy.insertData(data, site)));
          gdata.setMaxListeners(0);
          if (Options.get('debug-file') === true || Options.get('debug-file') === site) {
            gdata.pipe(intercept(function(file) {
              console.log('FILE: \n' + file.path);
              console.log('OLD CONTENT: \n' + file.contents.toString());
              return file;
            }));
          }
          gdata.pipe(jade())
            .pipe(rename(function(site) {
              return function(path) {
                path.basename = site;
              };
            }(site)))
            .pipe(gulp.dest('dummy/sites'));
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

      description: ['dummy task for compile jade files'],

    },

    styles: {

      starts: function() {
        return ['refresh'];
      },

      f: function() {
        Devel.current('styles');
        var s = Jsons.settings.data;

        for (var index = 0; index < s.styles.modes.length; index++) {
          Devel.log('processing: ' + s.styles.modes[index]);

          gulp
            // load source files
            .src('gulp/sass/common.sass')

            // laod functions for the files
            .pipe(insert.prepend(Drupal.insertStyle(s.styles.modes[index], s.styles.modes)))
            .pipe(sass())
            .pipe(autoprefixer())
            .pipe(rename(function(mode) {
              return function(path) {
                path.basename = mode;
              };
            }(s.styles.modes[index])))

            // write destination files
            .pipe(gulp.dest('styles'));
        }
      },

      options: {},

      def: function() {
        return {};
      },

      description: ['drupal task for compile sass files'],

    },

    jade: {

      starts: function() {
        return ['refresh'];
      },

      f: function() {
        Devel.current('jade');

        var jadeTemplates = Scan.dir('gulp/jade', true);

        Scan.walkFile(jadeTemplates, function(file, path) {
          if (file.info.name != 'mixins' && file.info.name != 'root' && file.info.extend == 'jade') {
            var gdata = gulp.src('.' + path + '/' + file.name)
              .pipe(plumber(function(file) {
                return function(e) {
                  Devel.scope('jade');
                  console.log();
                  Devel.error(e.name + ' while compile "' + file.info.name + '"');
                  if (Options.get('note') > 0 || Options.get('debug')) {
                    console.log(e._messageWithDetails());
                  }
                  Devel.debug(e.stack, 'estack');
                  console.log();
                  Devel.scope();
                };
              }(file)))
              .pipe(insert.prepend(Drupal.prependData()))
              .pipe(insert.append('\n+' + file.info.name + '({})\n'));

            if (Options.get('debug-file') === true || Options.get('debug-file') === file.info.name) {
              gdata.pipe(intercept(function(file) {
                console.log('FILE: \n' + file.path);
                console.log('OLD CONTENT: \n' + file.contents.toString());
                return file;
              }));
            }
            gdata.pipe(jade())
              .pipe(rename(function(path) {
                path.extname = '.tpl.php';
              }))
              .pipe(gulp.dest('./templates/' + path.substring('/gulp/jade/'.length)));
          }
        });
      },

      options: {},

      def: function() {
        return {};
      },

      description: ['compile drupal jade files'],

    },

    watch: {

      starts: function() {
        return ['refresh', 'jade', 'styles'];
      },

      f: function() {
        Devel.current('watch');

        gulp.watch('gulp/jade/**/*.jade', ['jade']);
        gulp.watch('gulp/sass/*.+(scss|sass)', ['styles']);
      },

      options: {},

      def: function() {
        return {};
      },

      description: ['watch and compile all drupal files'],

    },

    'watch-all': {

      starts: function() {
        return ['dummy-jade', 'dummy-index', 'styles', 'jade'];
      },

      f: function() {
        Devel.current('watch-all');
        var jsonTasks = [];
        if (Options.get('create') == 2) {
          jsonTasks.push('create');
        }
        jsonTasks.push('dummy-index');
        jsonTasks.push('dummy-jade');

        gulp.watch('gulp/sass/*.+(scss|sass)', ['styles']);
        gulp.watch('dummy/dummy.json', jsonTasks);
        gulp.watch('gulp/jade/**/*.jade', ['dummy-jade', 'jade']);
      },

      options: {},

      def: function() {
        return {};
      },

      description: ['watch and compile all files'],

    },

    create: {

      starts: function() {
        return ['refresh'];
      },

      f: function() {
        Devel.current('create');

        var dummy = Dummy.get();
        var includes = [];

        for (var site in dummy.sites) {
          for (var region in dummy.sites[site].regions) {
            Scan.element(dummy.sites[site].regions[region], function(element) {
              includes.push(element);
            });
          }
        }

        Devel.debug(includes, 'includes');

        for (var i = 0; i < includes.length; i++) {
          var parts = includes[i].split('/');
          var file = 'gulp/jade';

          for (var k = 0; k < parts.length; k++) {
            file += '/' + parts[k];
            if (k == parts.length - 1) {
              var writer = Factory.writer(file + '.jade');
              var nameparts = parts[k].split('--');

              writer.line('mixin ' + parts[k]);
              writer.line('  ');
              for (var z = 0; z < nameparts.length; z++) {
                writer.append('.' + Drupal.getID(nameparts[z]));
              }
              writer.line('    | auto generated ' + parts[k]);
              writer.write(true, true);
            } else {
              if (!Scan.fsExist(file)) {
                Devel.notice('Create directory "' + file + '"');
                fs.mkdirSync(file, function(e) {
                  if (e) {
                    Devel.error('Don\'t can create directory "' + file + '"', 'create-dir');
                  }
                });
              } else {
                Devel.notice('Exist directory "' + file + '"');
              }
            }
          }
        }
      },

      options: {},

      def: function() {
        return {};
      },

      description: ['scan the dummy json after templates end create them as jade files'],

    },

  },

  execute: function() {
    console.log();
    console.log(gutil.colors.cyan('DZ GULP DUMMY SYSTEM (GDS)'));
    console.log(gutil.colors.cyan('VERSION: ' + version));
    console.log();

    console.log('START INIT');
    Options.init();
    for (var task in this.tasks) {
      Devel.current(task);
      var starts = this.tasks[task].starts();

      if (starts.length) {
        gulp.task(task, starts, this.tasks[task].f);
      } else {
        gulp.task(task, this.tasks[task].f);
      }
    }

    if (Options.get('create') >= 1) {
      gulp.start('create');
    }

    console.log('END INIT');
    console.log();
  },

};

Tasks.execute();