module.parent.exports.Options = {

  devel: undefined,

  init: function() {
    this.devel = module.parent.exports.Devel;
  },  

  op: function(p) {
    console.log('options', p);
    this.devel.de(p);
  },

};