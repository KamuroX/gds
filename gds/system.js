var version = '1.2.1.0-dev';

var nodes = {
  fs: 'fs',
  gulp: 'gulp',
  plumber: 'gulp-plumber',
  insert: 'gulp-insert',
  intercept: 'gulp-intercept',
  jade: 'gulp-jade',
  rename: 'gulp-rename',
  sass: 'gulp-sass',
  autoprefixer: 'gulp-autoprefixer',
  jseditor: 'gulp-json-editor',
  gutil: 'gulp-util',
  base: './base',
};

module.exports.nodes = {};
for (var node in nodes) {
  module.exports.nodes[node] = require(nodes[node]);
}
module.exports.nodes.argv = require('yargs').argv;
var base = module.exports.nodes.base;

module.exports.out = function(output, color) {
  switch (color) {
    case 'g':
      console.log(module.exports.nodes.gutil.colors.green(output));
      break;
    case 'b':
      console.log(module.exports.nodes.gutil.colors.blue(output));
      break;
    case 'y':
      console.log(module.exports.nodes.gutil.colors.yellow(output));
      break;
    case 'r':
      console.log(module.exports.nodes.gutil.colors.red(output));
      break;
    case 'c':
      console.log(module.exports.nodes.gutil.colors.cyan(output));
      break;
    default:
      console.log(output);
      break;
  }
};

console.log();
console.log(module.exports.out('DZ GULP DUMMY SYSTEM (GDS)', 'c'));
console.log(module.exports.out('VERSION: ' + version, 'c'));
console.log();

module.exports.version = version;

var gds = {

  command: module.exports.nodes.argv['_'],

  registry: {},

  data: require('./gds.json'),

  add: function(key, f) {
    this.registry[key] = this.registry[key] || [];
    this.registry[key].push(f);
  },

  invoke: function(key, param) {
    var back = {};
    for (var f in (this.registry[key] || [])) {
      back = f(param, back);
    }
    return back;
  },

};
module.exports.gds = gds;

module.exports.plugins = {};

var modules = module.exports.nodes.fs.readdirSync('./gds/modules');
var tasks = module.exports.nodes.fs.readdirSync('./gds/tasks');

module.exports.modules = {};
for (var m in modules) {
  var mod = require('./modules/' + modules[m]);

  module.exports.modules[mod.name] = mod;
}

// module.exports.tasks = {};
// for (var t in tasks) {
//   var task = require('./tasks/' + tasks[t]);

//   module.exports.modules[task.name] = task;
// }

module.exports.nodes.gulp.task('gds', function() {
  if (module.exports.nodes.argv.list) {
    module.exports.out('List modules:');
    for (var name in module.exports.modules) {
      module.exports.out(' - ' + name + (base.isIntern(gds.data.enabled, name) ? ' (enabled)' : ''));
    }
  }
  if (module.exports.nodes.argv.en) {
    var en = module.exports.nodes.argv.en;

    module.exports.out('Enable module "' + en + '"');
    if (!base.isIntern(gds.data.enabled, en)) {
      module.exports.nodes.gulp.src('./gds/gds.json')
        .pipe(module.exports.nodes.jseditor(function(json) {
          json.enabled = json.enabled || [];
          json.enabled.push(en);
          return json;
        }))
        .pipe(module.exports.nodes.gulp.dest('./gds/'));
      module.exports.out('Module "' + en + '" was enabled!', 'g');
    } else {
      module.exports.out('Module "' + en + '" is already enabled!', 'r');
    }
  }
  if (module.exports.nodes.argv.dis) {
    var dis = module.exports.nodes.argv.dis;

    module.exports.out('Disable module "' + dis + '"');
    if (base.isIntern(gds.data.enabled, dis)) {
      module.exports.nodes.gulp.src('./gds/gds.json')
        .pipe(module.exports.nodes.jseditor(function(json) {
          json.enabled = json.enabled || [];
          var index = json.enabled.indexOf(dis);

          if (index !== -1) {
            delete json.enabled[index];
          }
          return json;
        }))
        .pipe(module.exports.nodes.gulp.dest('./gds/'));
      module.exports.out('Module "' + dis + '" was disabled!', 'g');
    } else {
      module.exports.out('Module "' + dis + '" is not enabled!', 'r');
    }
  }
});

if (gds.command != 'gds') {
  // regist other tasks
}
return;










// check and built dependencies of plugins
function checkDependencies() {
  for (var plugin in module.exports.plugins) {
    if (base.isset(module.exports.plugins[plugin].dependencies)) {
      var dependencies = module.exports.plugins[plugin].dependencies();

      for (var dependency in dependencies) {
        if (!base.isset(module.exports.plugins[dependencies[dependency]])) {
          console.log(colors.yellow('Don\'t load "' + plugin + '" plugin cause by missing dependent plugin "' + dependencies[dependency] + '"'));
          // delete this plugin and check all dependencies again
          delete module.exports.plugins[plugin];
          checkDependencies();
        } else {
          module.exports.plugins[plugin][dependencies[dependency]] = module.exports.plugins[dependencies[dependency]];
        }
      }
    }
  }
}

// merge base object into plugin and initalize plugin
function initPlugins() {
  for (var plugin in module.exports.plugins) {
    if (base.isset(module.exports.plugins[plugin].init)) {
      module.exports.plugins[plugin].init();
    }
  }
}



// paths to json files
var jsons = {
  dummy: '../dummy/dummy.json',
  settings: '../settings.json',
  local: '../local.json',
};

module.exports.jsons = {};

// load a json file
module.exports.loadJson = function(name, reload) {
  if (reload) {
    delete require.cache[require.resolve(name)];
  }
  try {
    module.exports.jsons[name] = require(jsons[name]);
  } catch (e) {
    module.exports.jsons[name] = undefined;
  }
  return module.exports.jsons[name];
};

// init jsons
for (var name in jsons) {
  module.exports.loadJson(name);
}

// load all plugins
module.exports.plugins = {};
for (var plugin in plugins) {
  require('./plugins/' + plugins[plugin]);
}

// load all tasks
module.exports.tasks = {};
for (var task in tasks) {
  var t = require('./tasks/' + tasks[task]);
  module.exports.tasks[t.name] = t;
}

checkDependencies();
initPlugins();
