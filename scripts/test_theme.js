Drupal.behaviors.testTheme = {

  attach: function(context, settings) {
    DZResponsive.add('example', this.responsive);
    // call responsive functions
    $(window).trigger('resize');
  },

  /**
    * @param mode - is the avtive mode
    *   options: [narrow, medium, wide]
    * @param options - a set of information for the function
    *   options.context - the drupal attach context
    *   options.settings - the drupal attach settings
    *   options.mode - the current mode
    *   options.oldMode - the old mode of the function
    *   options.width - the current width of the window element
    */
  responsive: function(mode, options) {

  },

};