module.exports = {

  name: 'options',
  options: {},
  groups: [],
  gds: undefined,
  argv: undefined,

  boot: function(gds) {
    this.gds = gds;
    this.argv = gds.get('nodes', 'argv');

    gds.add('options-sysoptions', this.optionsSysoptions, this);
  },

  optionsSysoptions: function(param, back, data) {
    back.user = {
      weight: -1000,
      options: {},
    };

    for (var name in data.argv) {
      if (name !== '_' && name !== '$0') {
        back.user.options[name] = data.argv[name];
      }
    }
    return back;
  },

  init: function(gds) {
    var sysoptions = gds.invoke('options-sysoptions');

    for (var group in sysoptions) {
      this.groups.push({
        name: group,
        weight: sysoptions[group].weight || 0,
      });

      for (var option in sysoptions[group].options) {
        if (gds.isObject(sysoptions[group].options[option])) {
          for (var taskoption in sysoptions[group].options[option]) {
            this.options[group + '-' + option + '-' + taskoption] = this.parseinput(sysoptions[group].options[option][taskoption]);
          }
        } else {
          this.options[group + '-' + option] = this.parseinput(sysoptions[group].options[option]);
        }
      }
    }

    this.groups = gds.sortWeight(this.groups);
  },

  searchingKeys: function(name) {
    var searchings = [];

    for (var i = 0; i < this.groups.length; i++) {
      searchings.push(this.groups[i].name + '-' + this.gds.current + '-' + name);
      searchings.push(this.groups[i].name + '-' + name);
    }
    return searchings;
  },

  parseinput: function(object) {
    if (this.gds.isString(object)) {
      object = object.replace(/ +(?= )/g, '').trim().split(' ');
    }
    return object;
  },

  is: function(name) {
    return this.gds.searchFor(this.options, this.searchingKeys(name)) !== false;
  },

  get: function(name) {
    return this.gds.searchFor(this.options, this.searchingKeys(name));
  },

};