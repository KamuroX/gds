var version = '1.1.0';
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

if (typeof String.prototype.startsWith != 'function') {
  String.prototype.startsWith = function(str){
    return this.slice(0, str.length) == str;
  };
}

if (typeof String.prototype.endsWith != 'function') {
  String.prototype.endsWith = function(str){
    return this.slice(-str.length) == str;
  };
}

function copyArray(array) {
  var newArray = [];

  for (var index in array) {
    newArray[index] = array[index];
  }
  return newArray;
}

function copyObject(object) {
  var newObject = {};

  for (var field in object) {
    newObject[field] = object[field];
  }
  return newObject;
}

function inArray(array, search) {
  for (var index in array) {
    if (array[index] == search) {
      return true;
    }
  }
  return false;
}

function isArray(object) {
  return Object.prototype.toString.call(object) === '[object Array]';
}

function isObject(object) {
  return object !== null && typeof object === 'object';
}

function isString(object) {
  return typeof object === 'string';
}

function isNumber(object) {
    return typeof object === 'number' && isFinite(object);
}

function isFunction(object) {
  return Object.prototype.toString.call(object) == '[object Function]';
}

function isBoolean(object) {
  return typeof object === 'boolean';
}

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
  * Helper function to built objects.
  */
var Factory = {

  /**
    * FACTORY BUILDER file
    * create a file object
    * @param string name - the name of the file
    * @param boolean directory - if the file is a directory
    */
  file: function(name, directory) {
    var file = {
      objType: 'file',
      name: name,
      isDirectory: directory,
      isFile: !directory,
    };
    file.info = Factory.fileInfo(file);
    if (directory) {
      file.files = {};

      /**
        * Add a file to the directory
        * @param object[file] file - the file to add
        * @return object[file] - the added object
        */
      file.add = function(file) {
        this.files[file.name] = file;
        return file;
      };

      /**
        * Get a file in the directory
        * @param string / number name - the name or the index of the file
        * @return object[file]
        */
      file.get = function(name) {
        if (isString(name)) {
          return this.files[name] !== undefined;
        } else if (isNumber(name)) {
          var count = 0;
          for (var index in this.files) {
            if (count == name) {
              return this.files[index];
            }
            count++;
          }
        }
        return false;
      };
    }
    return file;
  },
  /**
    * FACTORY BUILDER fileInfo
    * create a fileInfo object
    * @param object[file] file - the file object to create info from
    */
  fileInfo: function(file) {
    var fileInfo = {
      objType: 'fileInfo',
    };

    if (file.isDirectory) return fileInfo;

    var parts = file.name.split('.');
    fileInfo.name = parts[0];
    fileInfo.extend = parts[parts.length - 1];
    fileInfo.isNode = fileInfo.name.startsWith('node');
    fileInfo.isView = fileInfo.name.startsWith('views');
    if (fileInfo.isNode || fileInfo.isView) {
      fileInfo.tpls = fileInfo.name.split('--');
    }
    if (fileInfo.isNode) {
      fileInfo.def = fileInfo.tpls.length == 1;
      fileInfo.type = fileInfo.tpls[1];
      fileInfo.mode = fileInfo.tpls[2];
    }
    return fileInfo;
  },

  writer: function(path) {
    return {

      path: path,
      lines: [],

      line: function(line) {
        this.lines.push(line);
        return this;
      },

      append: function(string) {
        if (this.lines.length) {
          this.lines[this.lines.length - 1] += string;
        } else {
          this.line(string);
        }
        return this;
      },

      prepend: function(string) {
        if (this.lines.length) {
          this.lines[this.lines.length - 1] = string + this.lines[this.lines.length - 1];
        } else {
          this.line(string);
        }
        return this;
      },

      write: function(check) {
        if (Jsons.settings.data.lock && inArray(Jsons.settings.data.lock, this.path) && Scan.fsExist(this.path)) {
          Devel.error('Try to write a locked file "' + this.path + '"!');
          return;
        } 
        if (check && Scan.fsExist(this.path)) {
          Devel.warn('Try to write "' + this.path + '" but it is already created!');
          return;
        }
        var _lines = this.lines;
        var _path = this.path;
        Devel.notice('Writing file "' + _path + '" with ' + _lines.length + ' lines');
        fs.writeFile(_path, _lines.join('\n'), function(e) {
          if (e) {
            Devel.error('Writing file "' + _path + '" with ' + _lines.length + ' lines');
            return;
          }

          Devel.notice('File "' + _path + '" are saved');
        }); 
      },

    };
  },

};

var Jsons = {

  dummy: {
    path: 'dummy/dummy.json',
    data: {},
    exist: undefined,
  },
  settings: {
    path: 'settings.json',
    data: {},
    exist: undefined,
  },
  local: {
    path: 'local.json',
    data: {},
    exist: undefined,
  },

  init: function() {
    if (Jsons.inited === undefined) {
      Devel.notice('init jsons');

      Jsons.inited = true;
      Jsons.load('settings');
      Jsons.load('local');
    }
  },

  load: function(name) {
    if (Jsons[name].exist === undefined) {
      Jsons[name].exist = Scan.fsExist(Jsons[name].path, true);
    }
    if (Jsons[name].exist) {
      Devel.notice('load "' + name + '" json');
      Jsons[name].data = loadJson('./' + Jsons[name].path, true);
    }
  },

};

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

/**
  * STATIC OBJECT
  * Developer helper functions
  */
var Devel = {

  /**
    * Log infos about the var object.
    * @param object vars - a var to log
    */
  vars: function(vars) {
    if (isArray(vars)) {
      console.log('array[');
      for (var index in vars) {
        console.log('  ' + index + ': ' + Devel.type(vars[index]));
      }
      console.log(']');
    } else if (isObject(vars)) {
      console.log('object {');
      for (var index in vars) {
        console.log('  ' + index + ': ' + Devel.type(vars[index]));
      }
      console.log('}');
    }
    console.log('[' + Devel.type(vars) + '] ' + vars);
  },

  /**
    * Get the type of the var as string.
    * @param object vars - the var to check
    * @return string - the type of the vars object or "unknown" (unknown != undefined)
    */
  type: function(vars) {
    if (isArray(vars)) {
      return 'array';
    } else if (isObject(vars)) {
      return 'object';
    } else if (isString(vars)) {
      return 'string';
    } else if (isNumber(vars)) {
      return 'number';
    } else if (isFunction(vars)) {
      return 'function';
    } else if (vars === null) {
      return 'null';
    } else if (isBoolean(vars)) {
      return 'boolean';
    } else if (vars === undefined) {
      return 'undefined';
    }
    return 'unknown';
  },

  varCurrent: 'init',
  varScope: undefined,

  current: function(current) {
    if (current) {
      this.varCurrent = current;
    }
    return this.varCurrent;
  },

  scope: function(scope) {
    if (scope === undefined) {
      this.varCurrent = this.varScope;
      this.varScope = undefined;
    } else {
      if (this.varScope === undefined) {
        this.varScope = this.varCurrent;
      }
      this.varCurrent = scope;
    }
  },

  getCurrent: function(before) {
    if (before) {
      return '[' + before.toUpperCase() + '->' + this.current().toUpperCase() + ']';
    }
    return '[' + this.current().toUpperCase() + ']';
  },

  logs: function(object, depth) {
    if (Options.get('note') === false) return;
    if (depth === undefined) depth = '';

    if (isArray(object)) {
      for (var index in object) {
        Devel.logs(object[index], depth + '  ');
      }
    } else if (isString(object)) {
      console.log(depth + object);
    }
  },

  log: function(string) {
    if (Options.get('note') !== 0 || Options.get('debug')) {
      console.log(this.getCurrent(), string);
    }
  },

  notice: function(string) {
    if (Options.get('note') > 2 || Options.get('note') === false || Options.get('debug')) {
      console.log(gutil.colors.cyan(this.getCurrent('notice')), string);
    }
  },

  warn: function(string) {
    if (Options.get('note') > 1 || Options.get('note') === false || Options.get('debug')) {
      console.log(gutil.colors.yellow(this.getCurrent('warn')), string);
    }
  },

  error: function(string) {
    if (Options.get('note') > 0 || Options.get('note') === false || Options.get('debug')) {
      console.log(gutil.colors.red(this.getCurrent('error')), string);
    }
  },

};

var Dummy = {

  get: function() {
    var json = Jsons.dummy.data;

    if (json.version != version) {
      Devel.warn('dummy.json(' + json.version + ') and GDS(' + version + ') have not the same version!');
    }
    var data = {
      includes: this.includes(),
      scripts: this.scripts(json),
      sites: {},
    };

    var tools = [];
    for (var site in json.sites) {
      data.sites[site] = {
        regions: {},
      };
      data.sites[site].site = this.site(json, site);
      for (var region in json.regions) {
        data.sites[site].regions[region] = this.regions(json, region, site);
      }
      tools.push({
        title: json.sites[site].title || site,
        name: site,
      });
    }
    for (var site in json.sites) {
      data.sites[site].current = site;
      data.sites[site].tools = tools;
    }
    return data;
  },

  /**
    * Get the region
    */
  regions: function(json, region, site) {
    if (json.sites[site].regions[region] === undefined || isArray(json.sites[site].regions[region]) && !json.sites[site].regions[region].length) {
      return json.regions[region];
    }
    if (json.sites[site].regions[region].extend !== undefined) {
      return json.sites[json.sites[site].regions[region].extend].regions[region];
    }
    return json.sites[site].regions[region];
  },

  site: function(json, site) {
    json.site = json.site || {};

    return {
      lang: json.sites[site].lang || json.site.lang || 'de',
      dir: json.sites[site].dir || json.site.dir || 'ltr',
      title: json.sites[site].title || site,
      page: json.sites[site].page || json.site.page || 'page/page',
      html: json.sites[site].html || json.site.html || 'html/html',
      name: site,
      classes: json.sites[site].classes || [],
    };
  },

  includes: function() {
    var jadeFiles = Scan.dir('gulp/jade', Options.get('scan-includes'));
    var includes = ['mixins'];

    Scan.walkFile(jadeFiles, function(file, path) {
      if (file.info.extend && file.info.name !== 'root' && file.info.name !== 'mixins') {
        includes.push((path + '/' + file.info.name).substring('/gulp/jade/'.length));
      }
    });
    return includes;
  },

  scripts: function(json) {
    json.scripts = json.scripts || [];
    var scripts = {};
    var dependScripts = [];
    var scriptsFiles = Scan.dir('dummy/scripts', Options.get('scan-scripts'));

    Scan.walkFile(scriptsFiles, function(file, path) {
      if (file.info.extend && file.info.extend == 'js') {
        scripts[file.name] = ('..' + (path + '/' + file.name).substring('/dummy'.length));
      }
    });

    for (var index = 0; index < json.scripts.length; index++) {
      if (scripts[json.scripts[index]] !== undefined) {
        dependScripts.push(scripts[json.scripts[index]]);
      }
    }
    for (var index in scripts) {
      if (!inArray(json.scripts, index)) {
        dependScripts.push(scripts[index]);
      }
    }
    return dependScripts;
  },

  insertData: function(data, site) {
    var output = '';

    for (var input in data.includes) {
      output += 'include ' + data.includes[input] + '\n';
    }
    data.sites[site].scripts = data.scripts;
    data.sites[site].drupal = false;
    data.sites[site].dummy = true;
    output += '- var vars = ' + JSON.stringify(data.sites[site]) + ';\n';
    return output;
  },

};

var Drupal = {

  insertStyle: function(mode, modes) {
    var insert = '';

    for (var index in modes) {
      insert += '$' + modes[index] + ' : ';
      if (modes[index] == mode) {
        insert += 'true';
      } else {
        insert += 'false';
      }
      insert += '\n';
    }
    insert += '@import mixins\n';
    return insert;
  },

  prependData: function() {
    var output = '';
    var vars = {
      drupal: true,
      dummy: false,
    };

    output += '- var vars = ' + JSON.stringify(vars) + ';\n';
    output += 'include ../mixins\n';
    output += 'include ../root\n\n';
    return output;
  },

};

var Options = {

  init: function() {
    Jsons.init();
    var input = copyObject(argv);
    var local = {};
    var def = {};

    delete input['_'];
    delete input['$0'];

    if (Jsons.local.exist) {
      local = Jsons.local.data.options;
    }

    for (var task in Tasks.tasks) {
      def[task] = Tasks.tasks[task].def();
    }

    for (var task in def) {
      for (var op in def[task]) {
        this.options[task + '-' + op] = Scan.input(def[task][op]);
      }
    }
    for (var global in Tasks.globals) {
      this.options[global] = Tasks.globals[global].def;
    }
    for (var task in local) {
      if (isObject(local[task])) {
        for (var op in local[task]) {
          this.options['local-' + task + '-' + op] = Scan.input(local[task][op]);
        }
      } else {
        this.options['local-' + task] = Scan.input(local[task]);
      }
    }
    for (var op in input) {
      this.options['user-' + op] = Scan.input(input[op]);
    }

    if (Options.get('debug')) {
      Devel.log(this.options);
    }
  },

  options: {},

  searchings: function(name) {
    return [
      'user-' + Devel.current() + '-' + name,
      'user-' + name,
      'local-' + Devel.current() + '-' + name,
      'local-' + name,
      Devel.current() + '-' + name,
      name,
    ];
  },

  is: function(name) {
    var searching = this.searchings(name);

    for (var search in searching) {
      if (this.options[searching[search]] !== undefined) {
        return true;
      }
    }
    return false;
  },

  get: function(name) {
    var searching = this.searchings(name);

    for (var search in searching) {
      if (this.options[searching[search]] !== undefined) {
        return this.options[searching[search]];
      }
    }
    return false;
  },

};

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
  },

  tasks: {
    'dummy': {

      starts: function() {
        return ['refresh', 'dummy-jade', 'dummy-index', 'styles'];
      },

      f: function() {
        Devel.current('dummy');

        gulp.watch('gulp/jade/**/*.jade', ['dummy-jade']);
        gulp.watch('gulp/sass/*.+(scss|sass)', ['styles']);
        gulp.watch('dummy/dummy.json', ['dummy-index', 'dummy-jade']);
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
                if (Options.get('debug-stack')) {
                  console.log(e.stack);
                }
                console.log();
                Devel.scope();
              };
            }(site)))
            .pipe(insert.prepend(Dummy.insertData(data, site)));
          gdata.setMaxListeners(0);
          if (Options.get('debug-file')) {
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
                  if (Options.get('debug-stack')) {
                    console.log(e.stack);
                  }
                  console.log();
                  Devel.scope();
                };
              }(file)))
              .pipe(insert.prepend(Drupal.prependData()))
              .pipe(insert.append('\n+' + file.info.name + '({})\n'));

            if (Options.get('debug-file')) {
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

        gulp.watch('gulp/sass/*.+(scss|sass)', ['styles']);
        gulp.watch('dummy/dummy.json', ['dummy-index', 'dummy-jade']);
        gulp.watch('gulp/jade/**/*.jade', ['dummy-jade', 'jade']);
      },

      options: {},

      def: function() {
        return {};
      },

      description: ['watch and compile all files'],

    },

    test: {

      starts: function() {
        return [];
      },

      f: function() {
        Devel.current('test');

        var w = Factory.writer('test.txt');
        for (var i = 0; i < 10; i++) {
          w.prepend(i + ",");
        }
        w.write();
      },

      options: {},

      def: function() {
        return {};
      },

      description: ['test'],

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
    console.log('END INIT');
    console.log();
  },

};

Tasks.execute();