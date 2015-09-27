var version = '1.3.0.0-dev';

///////////////////////////////////////////////////////////////////////////////////////////////
//  global variable definition
///////////////////////////////////////////////////////////////////////////////////////////////

module.exports.version = version;
module.exports.nodes = {

  argv: require('yargs').argv,
  colors: require('gulp-util').colors,

};
module.exports.gds = require('./gds');
module.exports.modules = {};
module.exports.tasks = {};

///////////////////////////////////////////////////////////////////////////////////////////////
//  load node dependencies
///////////////////////////////////////////////////////////////////////////////////////////////

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
};

for (var node in nodes) {
  module.exports.nodes[node] = require(nodes[node]);
}

///////////////////////////////////////////////////////////////////////////////////////////////
//  local variable definition
///////////////////////////////////////////////////////////////////////////////////////////////

var gds = module.exports.gds;
var fs = module.exports.nodes.fs;

///////////////////////////////////////////////////////////////////////////////////////////////
//  system start
///////////////////////////////////////////////////////////////////////////////////////////////

gds.init();
console.log();
console.log(gds.out('DZ GULP DUMMY SYSTEM (GDS)', 'c'));
console.log(gds.out('VERSION: ' + version, 'c'));
console.log();

///////////////////////////////////////////////////////////////////////////////////////////////
//  load modules
///////////////////////////////////////////////////////////////////////////////////////////////

var modules = fs.readdirSync('./gds/modules');

for (var index in modules) {
  var mod = require('./modules/' + modules[index]);

  if (gds.isEnabled('modules', mod.name)) {
    module.exports.modules[mod.name] = mod;
  }
}

///////////////////////////////////////////////////////////////////////////////////////////////
//  load tasks
///////////////////////////////////////////////////////////////////////////////////////////////

var tasks = fs.readdirSync('./gds/tasks');

for (var t in tasks) {
  var task = require('./tasks/' + tasks[t]);

  if (gds.isEnabled('tasks', task.name)) {
    module.exports.modules[task.name] = task;
  }
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
