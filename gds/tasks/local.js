var plugins = module.parent.exports.plugins;
var base = module.parent.exports.base;

module.exports = {

  name: 'local',
  description: ['set local options'],

  starts: function() {
    return [];
  },

  f: function() {
    plugins.devel.current('local');

    plugins.gulp.src('./' + plugins.options.get('f')[0] + '.json')
      .pipe(plugins.jseditor(function(json) {
        var s = plugins.options.get('s');
        var d = plugins.options.get('d');
        var v = plugins.options.get('v');
        var k = plugins.options.get('k');

        if (s && s.length) {
          plugins.devel.log(getRec(s[0].split('.'), json.options));
        } else if (k && k.length && (v || base.isNumber(v))) {
          if (base.isArray(v)) {
            v = v[0];
          }
          setRec(k[0].split('.'), json.options, v);
          plugins.devel.log('set value "' + k[0] + '" to "' + v + '"');
        } else if (d && d.length) {
          removeRec(d[0].split('.'), json.options);
          plugins.devel.log('remove value "' + d[0] + '"');
        }
        return json;
      },
      // the second argument is passed to js-beautify as its option
      {
        'indent_char': ' ',
        'indent_size': 2
      }))
      .pipe(plugins.gulp.dest('.'));
  },

  options: {
    k: ['string - set or add a option need to set with -v option'],
    v: ['string - set the value for the option'],
    d: ['string - delete a option'],
    s: ['string - show a option'],
    f: ['string - the file to show or edit', ['local - the local json (default)', 'settings - the settings json']],
  },

  def: function() {
    return {
      f: 'local',
    };
  },

};

function getRec(keys, values) {
  var v = values;
  for (var index = 0; index < keys.length; index++) {
    v = v[keys[index]] || undefined;
  }
  return v;
}

function setRec(keys, values, value) {
  var v = values;
  for (var index = 0; index < keys.length - 1; index++) {
    v[keys[index]] = v[keys[index]] || {};
    v = v[keys[index]];
  }
  v[keys[index]] = value;
  return values;
}

function removeRec(keys, values) {
  var v = values;
  for (var index = 0; index < keys.length - 1; index++) {
    v[keys[index]] = v[keys[index]] || {};
    v = v[keys[index]];
  }
  delete v[keys[index]];
  return values;
}