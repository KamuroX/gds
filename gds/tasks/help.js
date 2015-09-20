var plugins = module.parent.exports.plugins;

module.exports = {

  name: 'help',
  description: ['help function'],

  starts: function() {
    return [];
  },

  f: function() {
    plugins.devel.current('help');

    console.log();
    if (plugins.options.get('g')) {
      console.log('Globals:');
      for (var option in Tasks.globals) {
        plugins.devel.logs([plugins.colors.green(option) + ':', Tasks.globals[option].description])
      }
      console.log();
    } else if (plugins.options.is('task')) {
      var task = plugins.options.get('task')[0];

      if (Tasks.tasks[task] === undefined) {
        plugins.devel.error('Task "' + task + '" don\'t exist!');
        console.log();
      } else {
        console.log('Task "' + plugins.colors.cyan(task) + '":');
        var optionsLog = [];
        for (var option in Tasks.tasks[task].options) {
          optionsLog.push(plugins.colors.green(option) + ':', Tasks.tasks[task].options[option]);
        }
        console.log();
        plugins.devel.logs(Tasks.tasks[task].description);
        console.log();
        if (optionsLog.length) {
          plugins.devel.logs(['Options:', optionsLog]);
          console.log();
        }
      }
    } else {
      console.log('Tasks:');
      for (var task in Tasks.tasks) {
        plugins.devel.logs([plugins.colors.green(task) + ':', Tasks.tasks[task].description])
      }
      console.log();
    }

    if (!plugins.options.is('task')) {
      console.log('Use ', plugins.colors.green('gulp help --task "') + plugins.colors.yellow('<task>') + plugins.colors.green('"'), 'for more infos');
      console.log();
    }
  },

  options: {
    task: ['string - the task name to get more infos'],
    g: ['boolean - infos about globals'],
  },

};