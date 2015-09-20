var base = require('./base');
var fs = require('fs');

module.exports.base = base;



function checkDependencies() {
  for (var plugin in module.exports.plugins) {
    if (base.isset(module.exports.plugins[plugin].dependencies)) {
      var dependencies = module.exports.plugins[plugin].dependencies();

      for (var dependency in dependencies) {
        if (!base.isset(module.exports.plugins[dependencies[dependency]])) {
          console.log(colors.yellow('Don\'t load "' + plugin + '" plugin cause by missing dependent plugin "' + dependencies[dependency] + '"'));
          delete module.exports.plugins[plugin];
          checkDependencies(); // check all dependencies again
        } else {
          module.exports.plugins[plugin][dependencies[dependency]] = module.exports.plugins[dependencies[dependency]];
        }
      }
    }
  }
}

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



var jsons = {
  dummy: 'dummy/dummy.json',
  settings: 'settings.json',
  local: 'local.json',
};

module.exports.jsons = {};

for (var name in jsons) {
  module.exports.jsons[field] = (fs.existsSync(jsons[name]) ? require(jsons[name]) : undefined);
}



var plugins = fs.readdirSync('./gds/plugins');
var tasks = fs.readdirSync('./gds/tasks');

for (var plugin in plugins) {
  require('./plugins/' + plugins[plugin]);
}

module.exports.plugins.fs = fs;
module.exports.plugins.colors = require('gulp-util').colors;

checkDependencies();
initPlugins();