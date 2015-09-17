var plugins = require('fs').readdirSync('./gds');
var gutil = require('gulp-util').colors;

for (var plugin in plugins) {
  if (plugins[plugin] !== 'Plugins.js') {
    require('./' + plugins[plugin]);
  }
}

for (var plugin in module.exports) {
  if (module.exports[plugin].dependencies !== undefined) {
    var dependencies = module.exports[plugin].dependencies();

    for (var dependency in dependencies) {
      if (module.exports[dependencies[dependency]] === undefined) {
        console.warn(gutil.yellow('Don\'t load "' + plugin + '" plugin cause by missing dependent plugin "' + dependencies[dependency] + '"'));
        delete module.exports[plugin];
        break;
      } else {
        module.exports[plugin][dependencies[dependency]] = module.exports[dependencies[dependency]];
      }
    }
    if (module.exports[plugin] !== undefined && module.exports[plugin].init !== undefined) {
      module.exports[plugin].init();
    }
  }
}
