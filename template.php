<?php

function test_res_path() {
  return $GLOBALS['base_path'] . path_to_theme() . '/res/';
}

/**
 * Implements hook_cs_alter().
 */
function test_css_alter(&$css) {
  foreach ($css as $key => $value) {
    if (strpos($key,'misc/ui/') === 0) {
      unset($css[$key]);
    }
  }
}

function test_field($vars) {
  $output = '';

  foreach ($vars['items'] as $delta => $item) {
    $output .= drupal_render($item);
  }

  return $output;
}

function test_preprocess_node(&$vars) {
  // Custom display templates will be called node--[viewmode].tpl.php
  $vars['theme_hook_suggestions'][] = 'node__' . $vars['view_mode'];
  // Custom display templates will be called node--[type]--[viewmode].tpl.php
  $vars['theme_hook_suggestions'][] = 'node__' . $vars['type'] . '__' . $vars['view_mode'];
  // Custom display templates will be called node--[type]--[viewmode]--[nid].tpl.php
  $vars['theme_hook_suggestions'][] = 'node__' . $vars['type'] . '__' . $vars['view_mode'] . '__' . $vars['node']->nid;

  $fields = field_info_fields();
  foreach ($fields as $name => $field) {
    if (!isset($vars['content'][$name])) {
      $vars['content'][$name] = array();
    }
  }

  $node = $vars['node'];
  $type = $vars['type'];
  $viewmode = $vars['view_mode'];
}

function test_preprocess_image(&$vars) {
  unset($vars['width'], $vars['height']);
}

/**
* Preprocesses the wrapping HTML.
*
* @param array &$vars
*   Template variables.
*/
function test_preprocess_html(&$vars) {
  if($vars['is_front']) {
    $title = explode('|', $vars['head_title']);
    $vars['head_title'] = $title[0];
  }
}