// Generated by CoffeeScript 1.6.3
(function() {
  define(['aloha', 'aloha/plugin', 'jquery', 'aloha/ephemera', 'ui/ui', 'ui/button', 'exercise/exercise-plugin', 'semanticblock/semanticblock-plugin', 'css!multipart/css/multipart-plugin.css'], function(Aloha, Plugin, jQuery, Ephemera, UI, Button, Exercise, semanticBlock) {
    var TEMPLATE, TYPE_CONTAINER, activate, deactivate;
    TEMPLATE = '<div class="multipart">\n    <div class="body"></div>\n</div>';
    TYPE_CONTAINER = '<div class="type-container dropdown aloha-ephemera">\n    <span class="type btn-link" data-toggle="dropdown"></span>\n    <ul class="dropdown-menu">\n        <li><span class="btn-link" data-type="Worked Example">Worked Example</span></li>\n        <li><span class="btn-link" data-type="homework">Homework</span></li>\n        <li><span class="btn-link" data-type="exercise">Exercise</span></li>\n    </ul>\n</div>';
    activate = function($element) {
      var $content, $header, $typeContainer, type,
        _this = this;
      type = $element.attr('data-type') || 'Worked Example';
      $typeContainer = jQuery(TYPE_CONTAINER);
      $typeContainer.find('.type').text(type.charAt(0).toUpperCase() + type.slice(1));
      $typeContainer.find('.dropdown-menu li').each(function(i, li) {
        if (jQuery(li).children('span').data('type') === type) {
          return jQuery(li).addClass('checked');
        }
      });
      $header = $element.children('.header');
      $content = $header.contents();
      $header.empty().addClass('aloha-block-dropzone').attr('placeholder', "Type the text of your header here.").aloha().append($content);
      $typeContainer.prependTo($element);
      return jQuery('<div>').addClass('exercise-controls').addClass('aloha-ephemera').append('<span class="add-exercise btn-link">Click here to add an exercise</span>').appendTo($element);
    };
    deactivate = function($element) {};
    return Plugin.create('multipart', {
      getLabel: function($element) {
        return 'multipart';
      },
      activate: activate,
      deactivate: deactivate,
      selector: '.multipart,.problemset',
      ignore: '.multipart > .header,.problemset > .header',
      init: function() {
        var multipart;
        multipart = this;
        semanticBlock.register(this);
        UI.adopt('insertMultipart', Button, {
          click: function() {
            return semanticBlock.insertAtCursor(TEMPLATE);
          }
        });
        semanticBlock.registerEvent('click', '.multipart .exercise-controls .add-exercise,\
                                              .problemset .exercise-controls .add-exercise', function() {
          var parent;
          parent = jQuery(this).parents(multipart.selector).first();
          console.log(multipart.selector, parent);
          Exercise.appendTo(parent);
          return jQuery(this).parents('.exercise-controls').appendTo(parent);
        });
        return semanticBlock.registerEvent('click', '.multipart > .type-container > ul > li > *,\
                                              .problemset > .type-container > ul > li > *', function(e) {
          var $el,
            _this = this;
          $el = jQuery(this);
          $el.parents('.type-container').first().children('.type').text($el.text());
          $el.parents('.aloha-oer-block').first().attr('data-type', $el.data('type'));
          $el.parents('aloha-oer-block').first().children('.exercise').each(function() {
            return jQuery(this).attr('data-type', $el.data('type'));
          });
          $el.parents('.type-container').find('.dropdown-menu li').each(function(i, li) {
            return jQuery(li).removeClass('checked');
          });
          return $el.parents('li').first().addclass('checked');
        });
      }
    });
  });

}).call(this);
