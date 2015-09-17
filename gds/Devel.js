module.parent.exports.Devel = {

  options: undefined,

  init: function() {
    this.options = module.parent.exports.Options;
  },

  test: function() {
    this.options.op('hallo');
  },

  de: function(p) {
    console.log(p, 'de');
  },

};