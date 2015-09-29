(function($) {

  Drupal.behaviors.gdstest = {

    attach: function(context, settings) {
      var canvas = $('<div></div>');

      $('#content').append(canvas);
    },


  };

})(jQuery);