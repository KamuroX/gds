var version = '1.2.1.0';
// import dependencies

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