var plugin = (module.parent.exports.plugins.scan = {

  baseMerge: true,

  dependencies: function() {
    return [
      'factory',
      'devel',
      'fs',
      'options',
    ];
  },


  /**
    * Get the mixin name from including file.
    * @param string string - a string from including file
    * @return string
    */
  include: function(string) {
    string = string.split('/');
    return string[string.length - 1];
  },

  /**
    * Run recursive through the element object and use a functions on all strings.
    * @param object element - an element to run through
    * @param callback f - a function to call for all strings
    *   - param string - the string
    */
  element: function(element, f) {
    if (this.isArray(element)) {
      for (var index in element) {
        if (this.element(element[index], f)) return true;
      }
    } else if (this.isObject(element)) {
      return this.element(element.items, f);
    } else if (this.isString(element)) {
      return f(element);
    }
    return false;
  },

  /**
    * Run recursive through the file object and use a function for all files.
    * @param object[file] file - the file object to run through
    * @param callback f - the function to call for all files
    *   - param object[file] - the file
    */
  walkFile: function(file, f, path) {
    if (file.objType === 'file') {
      path = path || '';
      f(file, path);
      if (file.isDirectory) {
        for (var index in file.files) {
          this.walkFile(file.files[index], f, path + '/' + file.name);
        }
      }
    }
  },

  /**
    * Check if a field exist in object.
    * @param object object - the object to check
    * @param array scan - an array of fields to check recursive in object
    * @return boolean
    */
  exist: function(object, scan) {
    for (var index in scan) {
      if (this.isset(object[scan[index]])) {
        object = object[scan[index]];
      } else {
        return false;
      }
    }
    return true;
  },

  dirCache: {},

  /**
    * Built the file tree.
    * @param string root - the directory to scan
    * @param boolean flush - clear the cache
    * @return object[file] - the file object of root
    */
  dir: function(root, flush) {
    if (flush || !this.isset(this.dirCache[root])) {
      this.devel.notice('scanning: ' + root);
      this.dirCache[root] = this.dirWalk(this.factory.file(root, true), root);
    }
    return this.dirCache[root];
  },

  /**
    * Helper function for scan.dir
    * @param object[file] result - the file object to add the files
    * @param string dir - the directory or file to scan
    * @return object[file] - the file object to create
    */
  dirWalk: function(result, dir) {
    var list = this.fs.readdirSync(dir);

    for (var index in list) {
      var name = list[index];
      var stat = this.fs.statSync(dir + '/' + name);
      var directory = stat && stat.isDirectory();
      var file = result.add(this.factory.file(name, directory));

      if (directory) {
        this.dirWalk(file, dir + '/' + name);
      }
    }
    return result;
  },

  input: function(object) {
    if (this.isString(object)) {
      object = object.replace(/ +(?= )/g, '').trim().split(' ');
    }
    return object;
  },

  fsExist: function(path, log) {
    try {
      return this.fs.existsSync(path);
    } catch (e) {
      if (log || this.options.get('note') == 5) {
        this.devel.error(e.toString());
      }
    }
    return false;
  }

});