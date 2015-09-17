if (Drupal === undefined) {
  var Drupal = {
    settings: {},
    behaviors: {},
  };
}

function copyArray(array) {
  var newArray = [];

  for (var index in array) {
    newArray[index] = array[index];
  }
  return newArray;
}

function copyObject(object) {
  var newObject = {};

  for (var field in object) {
    newObject[field] = object[field];
  }
  return newObject;
}

(function($) {
  $(document).ready(function() {
    $('body').addClass('js');
    for (var index in Drupal.behaviors) {
      Drupal.behaviors[index].attach(document, Drupal.settings);
    }
    initDummyTools($);
  });
}(jQuery));

function initDummyTools($) {
  console.log('init dummy tools');
  initDummyPagerTool($);
  var tool = $('<div id="dummy-tool"></div>');
  var mediaTab = $('<div class="tool-media-tab tool-tab"></div>');
  var siteTab = $('<div class="tool-site-tab tool-tab"><div>');
  var tabClear = $('<div class="tool-clear tool-tab"><div class="tool-tab-title">x</div></div>');
  var tabToggler = $('<div class="tool-toggler tool-tab"><div class="tool-tab-title">dz</div></div>');

  dummyToolMediaTab(mediaTab);
  dummyToolSiteTab(siteTab);

  tool.append(mediaTab).append(siteTab).append(tabClear).append(tabToggler);

  $('.tool-tab-title', tabToggler).bind('click', function() {
    $(this).toggleClass('look');
    tool.toggleClass('look');
  });

  $('.tool-tab-title', tabClear).bind('click', function() {
    dummyToolClear();
  });

  $('body').append(tool);
  DZResponsive.add('dummy-tool', dummyToolResponsive, {mediaTab: mediaTab});
  $(window).trigger('resize');

  vars.tools.files = {};
  var modes = ['narrow', 'medium', 'wide']
  for (var index in modes) {
    vars.tools.files[modes[index]] = {
      file: $('.' + modes[index] + '-style'),
      media: $('.' + modes[index] + '-style').attr('media'),
    }
  }
}

function dummyToolResponsive(mode, options) {
  var title = $('.tool-tab-title', options.mediaTab);
  if (!title.hasClass('look')) {
    title.text(mode);
  }
  var links = $('.tool-design-link');

  $.each(links, function() {
    var that = $(this);

    that.attr('href', '../design/' + that.data('name') + '-' + title.text() + '.png');
  });
}

function dummyToolClear() {
  DZResponsive.remove('dummy-tool');
  $('#dummy-tool').remove();
  $('html').css('max-width', '').css('margin', '0 auto');

  var modes = ['narrow', 'medium', 'wide']
  for (var index in modes) {
    vars.tools.files[modes[index]].file.attr('media', vars.tools.files[modes[index]].media);
  }
}

function dummyToolMediaTab(mediaTab) {
  var mediaTitle = $('<div class="tool-tab-title"></div>');
  mediaTab.append(mediaTitle);
  var content = $('<div class="tool-tab-content"></div>');

  mediaTitle.bind('click', function() {
    if (mediaTitle.hasClass('look')) {
      $('.tool-option.look', mediaTab).removeClass('look');
      mediaTitle.removeClass('look');
      $('html').css('max-width', '').css('margin', '0 auto');
      DZResponsive.force('dummy-tool');

      var modes = ['narrow', 'medium', 'wide']
      for (var index in modes) {
        vars.tools.files[modes[index]].file.attr('media', vars.tools.files[modes[index]].media);
      }
    }
  });

  for (var index in vars.tools.modes) {
    var option = $('<div class="tool-option">' + vars.tools.modes[index] + '</div>');
    option.bind('click', function() {
      $('.tool-option.look', mediaTab).removeClass('look');
      var that = $(this);
      var text = that.text();
      if (text == 'narrow') {
        $('html').css('max-width', vars.tools.breakpoints.narrowMedium).css('margin', '0 auto');
        vars.tools.files.narrow.file.removeAttr('media');
        vars.tools.files.medium.file.attr('media', 'none');
        vars.tools.files.wide.file.attr('media', 'none');
      } else if (text == 'medium') {
        $('html').css('max-width', vars.tools.breakpoints.mediumWide).css('margin', '0 auto');
        vars.tools.files.medium.file.removeAttr('media');
        vars.tools.files.narrow.file.attr('media', 'none');
        vars.tools.files.wide.file.attr('media', 'none');
      } else if (text == 'wide') {
        $('html').css('max-width', '').css('margin', '0 auto');
        vars.tools.files.wide.file.removeAttr('media');
        vars.tools.files.narrow.file.attr('media', 'none');
        vars.tools.files.medium.file.attr('media', 'none');
      }
      mediaTitle.text(text).addClass('look');
      DZResponsive.force('dummy-tool');
    });
    content.append(option);
  }

  mediaTab.append(content);
}

function dummyToolSiteTab(siteTab) {
  siteTab.append($('<div class="tool-tab-title">' + dummyToolGetCurrentSite().title + '</div>'));
  var content = $('<div class="tool-tab-content"></div>');
  var tools = copyArray(vars.tools);

  tools.unshift({
    name: 'index',
    title: 'Index',
  });
  for (var index in tools) {
    var option = $('<div class="tool-option"></div>');

    option.append($('<a href="' + tools[index].name + '.html" class="tool-site-link tool-link">' + tools[index].title + '</a>'));
    option.append($('<a href="#" class="tool-design-link tool-link" target="_blank" data-name="' + tools[index].name + '">-></a>'));
    content.append(option);
  }

  siteTab.append(content);
}

function dummyToolGetCurrentSite() {
  for (var index in vars.tools) {
    if (vars.current == vars.tools[index].name) {
      return vars.tools[index];
    }
  }
  return undefined;
}

function dummyPagerGetElements() {
  var pager = {
    prev: undefined,
    next: undefined,
  };
  for (var i = 0; i < vars.tools.length; i++) {
    if (vars.site.name == vars.tools[i].name) {
      if (i == 0) {
        pager.prev = vars.tools.length - 1;
      } else {
        pager.prev = i - 1;
      }
      if (i == vars.tools.length - 1) {
        pager.next = 0;
      } else {
        pager.next = i + 1;
      }
    }
  }
  return pager;
}

function dummyPagerGoto(index) {
  var locations = window.location.href.split('/');

  locations[locations.length - 1] = vars.tools[index].name;
  window.location.href = locations.join('/') + '.html';
}

function initDummyPagerTool($) {
  var pager = dummyPagerGetElements();
  $(document).keydown(function(key) {
    switch (parseInt(key.which, 10)) {
      // Left arrow key pressed
      case 37:
        dummyPagerGoto(pager.prev);
        break;
      // Right Arrow Pressed
      case 39:
        dummyPagerGoto(pager.next);
        break;
    }
  });
}