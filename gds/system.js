var version = '1.2.1.0';



var colors = require('gulp-util').colors;

console.log();
console.log(colors.cyan('DZ GULP DUMMY SYSTEM (GDS)'));
console.log(colors.cyan('VERSION: ' + version));
console.log();



var base = require('./base');
var fs = require('fs');

var extendPlugins = {
  gulp: 'gulp',
  plumber: 'gulp-plumber',
  insert: 'gulp-insert',
  intercept: 'gulp-intercept',
  jade: 'gulp-jade',
  rename: 'gulp-rename',
  sass: 'gulp-sass',
  autoprefixer: 'gulp-autoprefixer',
};

module.exports.base = base;
module.exports.version = version;


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
    if (module.exports.plugins[plugin].baseMerge) {
      module.exports.plugins[plugin] = base.merge(module.exports.plugins[plugin], base, true);
    }
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



var plugins = fs.readdirSync('./gds/plugins');
var tasks = fs.readdirSync('./gds/tasks');

// load all plugins
module.exports.plugins = {};
for (var plugin in plugins) {
  require('./plugins/' + plugins[plugin]);
}

// load all nodejs plugins
module.exports.plugins.fs = fs;
module.exports.plugins.colors = colors;
for (var extPlugin in extendPlugins) {
  module.exports.plugins[extPlugin] = require(extendPlugins[extPlugin]);
}

// load all tasks
module.exports.tasks = {};
for (var task in tasks) {
  var t = require('./tasks/' + tasks[task]);
  module.exports.tasks[t.name] = t;
}

checkDependencies();
initPlugins();