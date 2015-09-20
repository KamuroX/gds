var fs = require('fs');
var colors = require('gulp-util').colors;

module.exports.base = require('./base');
var base = module.exports.base;

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
    module.exports.plugins[plugin] = base.merge(module.exports.plugins[plugin], base, true);
    if (base.isset(module.exports.plugins[plugin].init)) {
      module.exports.plugins[plugin].init();
    }
  }
}



var plugins = fs.readdirSync('./gds/plugins');
var tasks = fs.readdirSync('./gds/tasks');

for (var plugin in plugins) {
  require('./plugins/' + plugins[plugin]);
}

checkDependencies();
initPlugins();