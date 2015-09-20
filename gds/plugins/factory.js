var plugin = (module.parent.exports.plugins.factory = {

  baseMerge: true,

  dependencies: function() {
    return [
      'devel',
      'fs',
      'scan',
    ];
  },

  /**
    * FACTORY BUILDER file
    * create a file object
    * @param string name - the name of the file
    * @param boolean directory - if the file is a directory
    */
  file: function(name, directory) {
    var file = {
      objType: 'file',
      name: name,
      isDirectory: directory,
      isFile: !directory,
    };
    file.info = this.fileInfo(file);
    if (directory) {
      file.files = {};

      /**
        * Add a file to the directory
        * @param object[file] file - the file to add
        * @return object[file] - the added object
        */
      file.add = function(file) {
        this.files[file.name] = file;
        return file;
      };

      /**
        * Get a file in the directory
        * @param string / number name - the name or the index of the file
        * @return object[file]
        */
      file.get = function(name) {
        if (plugin.isString(name)) {
          return this.files[name] !== undefined;
        } else if (plugin.isNumber(name)) {
          var count = 0;
          for (var index in this.files) {
            if (count == name) {
              return this.files[index];
            }
            count++;
          }
        }
        return false;
      };
    }
    return file;
  },

  /**
    * FACTORY BUILDER fileInfo
    * create a fileInfo object
    * @param object[file] file - the file object to create info from
    */
  fileInfo: function(file) {
    var fileInfo = {
      objType: 'fileInfo',
    };

    if (file.isDirectory) return fileInfo;

    var parts = file.name.split('.');
    fileInfo.name = parts[0];
    fileInfo.extend = parts[parts.length - 1];
    fileInfo.isNode = this.startsWith(fileInfo.name, 'node');
    fileInfo.isView = this.startsWith(fileInfo.name, 'views');
    if (fileInfo.isNode || fileInfo.isView) {
      fileInfo.tpls = fileInfo.name.split('--');
    }
    if (fileInfo.isNode) {
      fileInfo.def = fileInfo.tpls.length == 1;
      fileInfo.type = fileInfo.tpls[1];
      fileInfo.mode = fileInfo.tpls[2];
    }
    return fileInfo;
  },

  version: function(version) {
    return {

      objType: 'version',
      version: version.split('.'),

      get: function() {
        return this.version.join('.');
      },

      compare: function(version, save) {
        for (var i = 0; i < save; i++) {
          if (version.version[i] !== this.version[i]) return false;
        }
        return true;
      },

    };
  },

  writer: function(path) {
    return {

      objType: 'writer',
      path: path,
      lines: [],

      line: function(line) {
        this.lines.push(line);
        return this;
      },

      append: function(string) {
        if (this.lines.length) {
          this.lines[this.lines.length - 1] += string;
        } else {
          this.line(string);
        }
        return this;
      },

      prepend: function(string) {
        if (this.lines.length) {
          this.lines[this.lines.length - 1] = string + this.lines[this.lines.length - 1];
        } else {
          this.line(string);
        }
        return this;
      },

      write: function(check, notice) {
        if (check && plugin.scan.fsExist(this.path)) {
          if (notice) {
            plugin.devel.notice('Try to write "' + this.path + '" but it is already created!');
          } else {
            plugin.devel.warn('Try to write "' + this.path + '" but it is already created!');
          }
          return;
        }
        var _lines = this.lines;
        var _path = this.path;

        plugin.devel.notice('Writing file "' + _path + '" with ' + _lines.length + ' lines');
        plugin.fs.writeFile(_path, _lines.join('\n'), function(e) {
          if (e) {
            plugin.devel.error('Writing file "' + _path + '" with ' + _lines.length + ' lines');
            return;
          }

          plugin.devel.notice('File "' + _path + '" are saved');
        });
      },

    };
  },

});