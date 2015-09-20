var plugin = (module.parent.exports.plugins.dummy = {

  baseMerge = true,

  dependencies: function() {
    return [
      'factory',
      'devel',
      'scan',
    ];
  },

  get: function() {
    var json = module.parent.exports.jsons.dummy;

    var jsonversion = this.factory.version(json.version);
    var gulpversion = this.factory.version(version);

    if (!jsonversion.compare(gulpversion, this.options.get('version'))) {
      this.devel.warn('The version of the json file is not certain compatible!', 'version');
    }
    var data = {
      includes: this.includes(),
      scripts: this.scripts(json),
      sites: {},
    };

    var tools = [];
    for (var site in json.sites) {
      data.sites[site] = {
        regions: {},
      };
      data.sites[site].site = this.site(json, site);
      for (var region in json.regions) {
        data.sites[site].regions[region] = this.regions(json, region, site);
      }
      tools.push({
        title: json.sites[site].title || site,
        name: site,
      });
    }
    for (var site in json.sites) {
      data.sites[site].tools = tools;
    }
    return data;
  },

  /**
    * Get the region
    */
  regions: function(json, region, site) {
    if (!this.isset(json.sites[site].regions[region]) || this.isArray(json.sites[site].regions[region]) && !json.sites[site].regions[region].length) {
      return json.regions[region];
    }
    if (this.isset(json.sites[site].regions[region].extend)) {
      return json.sites[json.sites[site].regions[region].extend].regions[region];
    }
    return json.sites[site].regions[region];
  },

  site: function(json, site) {
    json.site = json.site || {};

    return {
      lang: json.sites[site].lang || json.site.lang || 'de',
      dir: json.sites[site].dir || json.site.dir || 'ltr',
      title: json.sites[site].title || site,
      page: json.sites[site].page || json.site.page || 'page/page',
      html: json.sites[site].html || json.site.html || 'html/html',
      name: site,
      classes: json.sites[site].classes || [],
    };
  },

  includes: function() {
    var jadeFiles = this.scan.dir('gulp/jade', this.options.get('scan-includes'));
    var includes = ['mixins'];

    this.scan.walkFile(jadeFiles, function(file, path) {
      if (file.info.extend && file.info.name !== 'root' && file.info.name !== 'mixins') {
        includes.push((path + '/' + file.info.name).substring('/gulp/jade/'.length));
      }
    });
    return includes;
  },

  scripts: function(json) {
    json.scripts = json.scripts || [];
    var scripts = {
      dummy: {},
      drupal: {},
    };
    var dependScripts = {
      dummy: [],
      drupal: [],
    };

    this.scan.walkFile(this.scan.dir('dummy/scripts', this.options.get('scan-scripts')), function(file, path) {
      if (file.info.extend && file.info.extend == 'js') {
        scripts.dummy[file.name] = ('..' + (path + '/' + file.name).substring('/dummy'.length));
      }
    });

    this.scan.walkFile(this.scan.dir('scripts', this.options.get('scan-scripts')), function(file, path) {
      if (file.info.extend && file.info.extend == 'js') {
        scripts.drupal[file.name] = ('..' + (path + '/' + file.name).substring('/dummy'.length));
      }
    });

    for (var scope in scripts) {
      for (var index = 0; index < json.scripts.length; index++) {
        if (this.isset(scripts[scope][json.scripts[index]])) {
          dependScripts[scope].push(scripts[scope][json.scripts[index]]);
        }
      }
      for (var index in scripts[scope]) {
        if (!this.isIntern(json.scripts, index)) {
          dependScripts[scope].push(scripts[scope][index]);
        }
      }
    }
    return dependScripts;
  },

  insertData: function(data, site) {
    var output = '';

    for (var input in data.includes) {
      output += 'include ' + data.includes[input] + '\n';
    }
    data.sites[site].scripts = data.scripts;
    data.sites[site].drupal = false;
    data.sites[site].dummy = true;
    data.sites[site].version = version;
    output += '- var vars = ' + JSON.stringify(data.sites[site]) + ';\n';
    return output;
  },

});