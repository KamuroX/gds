var plugins = require('fs').readdirSync('./gds');

for (var plugin in plugins) {
  if (plugins[plugin] !== 'Plugins.js') {
    require('./' + plugins[plugin]);
  }
}

for (var plugin in module.exports) {
  if (module.exports[plugin].init !== undefined) {
    module.exports[plugin].init();
  }
}
