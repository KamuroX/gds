
(function($) {

  Drupal.behaviors.DZResponsive = {

    attach: function(context, settings) {
      DZResponsive.context = context;
      DZResponsive.settings = settings;
      $(window).bind('resize', function() {
        DZResponsive.update();
      });
    },

  };

}(jQuery));

Drupal.settings.breakpoints = {
  narrowMedium: 545,
  mediumWide: 1025
};

var DZResponsive = {

  registry: {},
  context: undefined,
  settings: undefined,

  /**
    * Get the current mode of the window
    * @return one mode options: [narrow, medium, wide]
    */
  getMode: function() {
    var width = $(window).width();

    if (width <= Drupal.settings.breakpoints.narrowMedium) {
      return 'narrow';
    }
    if (width > Drupal.settings.breakpoints.narrowMedium && width <= Drupal.settings.breakpoints.mediumWide) {
      return 'medium';
    }
    if (width > Drupal.settings.breakpoints.mediumWide) {
      return 'wide';
    }
    console.warn('somthing goes wrong');
    return 'error';
  },

  /**
    * Add a function to look up for changes
    * @param name - unique name of the function to avoid duplicates
    * @param f - the function to call by changes
    *   functions param are:
    *     mode - the current mode (narrow, medium, wide)
    *     data - a set of infomations
    * @param options - a set of informations for the function
    */
  add: function(name, f, options) {
    this.registry[name] = {
      f: f,
      options: options || {},
      mode: undefined,
    };
  },

  /**
    * Remove the function with this name.
    * @param name - the name of the function to remove
    */
  remove: function(name) {
    delete this.registry[name];
  },

  getOptions: function(name) {
    return this.registry[name].options;
  },

  setOptions: function(name, options) {
    return this.registry[name].options = options;
  },

  /**
    * Update all function that are listen
    */
  update: function() {
    var mode = this.getMode();
    var width = $(window).width();

    for (var index in this.registry) {
      if (this.registry[index].mode != mode || this.registry[index].options.always) {
        this.updateFunction(mode, width, index);
      }
    }
  },

  updateFunction: function(mode, width, index) {
    this.registry[index].options.mode = mode;
    this.registry[index].options.oldMode = this.registry[index].mode;
    this.registry[index].options.context = this.context;
    this.registry[index].options.settings = this.settings;
    this.registry[index].options.width = width;

    this.registry[index].f(mode, this.registry[index].options);
    this.registry[index].mode = mode;
  },

  force: function(name) {
    var mode = this.getMode();
    var width = $(window).width();
    this.updateFunction(mode, width, name);
  }

};

