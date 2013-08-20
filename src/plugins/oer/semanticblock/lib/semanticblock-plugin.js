// Generated by CoffeeScript 1.6.3
(function() {
  define(['aloha', 'block/blockmanager', 'aloha/plugin', 'aloha/pluginmanager', 'jquery', 'aloha/ephemera', 'ui/ui', 'ui/button', 'copy/copy-plugin', 'css!semanticblock/css/semanticblock-plugin.css'], function(Aloha, BlockManager, Plugin, pluginManager, jQuery, Ephemera, UI, Button, Copy) {
    var DIALOG_HTML, activate, bindEvents, blockControls, blockDragHelper, blockTemplate, cleanIds, cleanWhitespace, copyBuffer, deactivate, getLabel, insertElement, pluginEvents, registeredTypes;
    if (pluginManager.plugins.semanticblock) {
      return pluginManager.plugins.semanticblock;
    }
    DIALOG_HTML = '<div class="semantic-settings modal hide" id="linkModal" tabindex="-1" role="dialog" aria-hidden="true" data-backdrop="false">\n  <div class="modal-header">\n    <h3></h3>\n  </div>\n  <div class="modal-body">\n    <div style="margin: 20px 10px 20px 10px; padding: 10px; border: 1px solid grey;">\n        <strong>Custom class</strong>\n        <p>\n            Give this element a custom "class". Nothing obvious will change in your document.\n            This is for advanced book styling and requires support from the publishing system.\n        </p> \n        <input type="text" placeholder="custom element class" name="custom_class">\n    </div>\n  </div>\n  <div class="modal-footer">\n    <button class="btn btn-primary action submit">Save changes</button>\n    <button class="btn action cancel">Cancel</button>\n  </div>\n</div>';
    blockTemplate = jQuery('<div class="semantic-container aloha-ephemera-wrapper"></div>');
    blockControls = jQuery('<div class="semantic-controls aloha-ephemera">\n  <button class="semantic-delete" title="Remove this element."><i class="icon-remove"></i></button>\n  <button class="semantic-settings" title="advanced options."><i class="icon-cog"></i></button>\n  <button class="copy" title="copy"><i class="icon-file"></i></button>\n</div>');
    blockDragHelper = jQuery('<div class="semantic-drag-helper aloha-ephemera">\n    <div class="title"></div>\n    <div class="body">Drag me to the desired location in the document</div>\n</div>');
    registeredTypes = [];
    copyBuffer = null;
    pluginEvents = [
      {
        name: 'mouseenter',
        selector: '.aloha-block-draghandle',
        callback: function() {
          return jQuery(this).parents('.semantic-container').addClass('drag-active');
        }
      }, {
        name: 'mouseleave',
        selector: '.aloha-block-draghandle',
        callback: function() {
          if (!jQuery(this).parents('.semantic-container').is('.aloha-oer-dragging')) {
            return jQuery(this).parents('.semantic-container').removeClass('drag-active');
          }
        }
      }, {
        name: 'mouseenter',
        selector: '.semantic-delete',
        callback: function() {
          return jQuery(this).parents('.semantic-container').addClass('delete-hover');
        }
      }, {
        name: 'mouseleave',
        selector: '.semantic-delete',
        callback: function() {
          return jQuery(this).parents('.semantic-container').removeClass('delete-hover');
        }
      }, {
        name: 'mousedown',
        selector: '.aloha-block-draghandle',
        callback: function(e) {
          e.preventDefault();
          return jQuery(this).parents('.semantic-container').addClass('aloha-oer-dragging', true);
        }
      }, {
        name: 'mouseup',
        selector: '.aloha-block-draghandle',
        callback: function() {
          return jQuery(this).parents('.semantic-container').removeClass('aloha-oer-dragging');
        }
      }, {
        name: 'click',
        selector: '.semantic-container .semantic-delete',
        callback: function() {
          return jQuery(this).parents('.semantic-container').first().slideUp('slow', function() {
            return jQuery(this).remove();
          });
        }
      }, {
        name: 'click',
        selector: '.semantic-container .semantic-controls .copy',
        callback: function(e) {
          var $element;
          $element = jQuery(this).parents('.semantic-container').first();
          return Copy.buffer($element.outerHtml());
        }
      }, {
        name: 'click',
        selector: '.semantic-container .semantic-settings',
        callback: function(e) {
          var $element, dialog, elementName;
          if (jQuery('.semantic-settings.modal:visible').length) {
            return;
          }
          dialog = jQuery(DIALOG_HTML);
          dialog.modal('show');
          dialog.css({
            'margin-top': (jQuery(window).height() - dialog.height()) / 2,
            'top': '0'
          });
          $element = jQuery(this).parents('.semantic-controls').siblings('.aloha-oer-block');
          elementName = getLabel($element);
          dialog.find('h3').text('Edit options for this ' + elementName);
          dialog.find('[name=custom_class]').val($element.attr('data-class'));
          return dialog.data('element', $element);
        }
      }, {
        name: 'click',
        selector: '.modal.semantic-settings .action.cancel',
        callback: function(e) {
          var $dialog;
          $dialog = jQuery(this).parents('.modal');
          return $dialog.modal('hide');
        }
      }, {
        name: 'click',
        selector: '.modal.semantic-settings .action.submit',
        callback: function(e) {
          var $dialog, $element;
          $dialog = jQuery(this).parents('.modal');
          $dialog.modal('hide');
          $element = $dialog.data('element');
          $element.attr('data-class', $dialog.find('[name=custom_class]').val());
          if ($element.attr('data-class') === '') {
            return $element.removeAttr('data-class');
          }
        }
      }, {
        name: 'mouseover',
        selector: '.semantic-container',
        callback: function() {
          jQuery(this).parents('.semantic-container').removeClass('focused');
          if (!jQuery(this).find('.focused').length) {
            jQuery(this).addClass('focused');
          }
          return jQuery(this).find('.aloha-block-handle').attr('title', 'Drag this element to another location.');
        }
      }, {
        name: 'mouseout',
        selector: '.semantic-container',
        callback: function() {
          return jQuery(this).removeClass('focused');
        }
      }, {
        name: 'blur',
        selector: '[placeholder],[hover-placeholder]',
        callback: function() {
          var $el;
          $el = jQuery(this);
          if (!$el.text().trim() && !$el.find('.aloha-oer-block').length) {
            return $el.empty();
          }
        }
      }
    ];
    insertElement = function(element) {};
    getLabel = function($element) {
      var type, _i, _len;
      for (_i = 0, _len = registeredTypes.length; _i < _len; _i++) {
        type = registeredTypes[_i];
        if ($element.is(type.selector)) {
          return type.getLabel($element);
        }
      }
    };
    activate = function($element) {
      var $contents, $title, type, _i, _len;
      if (!($element.is('.semantic-container') || ($element.is('.alternates') && $element.parents('figure').length))) {
        $element.addClass('aloha-oer-block');
        $('<p class="aloha-oer-ephemera-if-empty"></p>').insertBefore($element);
        $('<p class="aloha-oer-ephemera-if-empty"></p>').insertAfter($element);
        $element.wrap(blockTemplate).parent().append(blockControls.clone()).alohaBlock();
        for (_i = 0, _len = registeredTypes.length; _i < _len; _i++) {
          type = registeredTypes[_i];
          if ($element.is(type.selector)) {
            type.activate($element);
            return;
          }
        }
        $element.children('[placeholder],[hover-placeholder]').andSelf().filter('[placeholder],[hover-placeholder]').each(function() {
          if (!jQuery(this).text().trim()) {
            return jQuery(this).empty();
          }
        });
        $title = $element.children('.title').first();
        $title.attr('hover-placeholder', 'Add a title');
        $title.aloha();
        $contents = $element.children().not($title);
        $contents.wrap(jQuery('<div class="body"></body>'));
        return $element.children('.body').aloha();
      }
    };
    deactivate = function($element) {
      var $title, type, _i, _len;
      $element.removeClass('aloha-oer-block ui-draggable');
      $element.removeAttr('style');
      for (_i = 0, _len = registeredTypes.length; _i < _len; _i++) {
        type = registeredTypes[_i];
        if ($element.is(type.selector)) {
          type.deactivate($element);
          return;
        }
      }
      $title = $element.children('.title').first().mahalo().removeClass('aloha-editable aloha-block-blocklevel-sortable ui-sortable').removeAttr('hover-placeholder');
      $element.find('.body').children().unwrap();
      return $element.attr('data-unknown', 'true');
    };
    bindEvents = function(element) {
      var event, i, _results;
      if (element.data('oerBlocksInitialized')) {
        return;
      }
      element.data('oerBlocksInitialized', true);
      event = void 0;
      i = void 0;
      i = 0;
      _results = [];
      while (i < pluginEvents.length) {
        event = pluginEvents[i];
        element.on(event.name, event.selector, event.callback);
        _results.push(i++);
      }
      return _results;
    };
    cleanIds = function(content) {
      var element, elements, i, id, ids, _i, _ref, _results;
      elements = content.find('[id]');
      ids = {};
      _results = [];
      for (i = _i = 0, _ref = elements.length; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
        element = jQuery(elements[i]);
        id = element.attr('id');
        if (ids[id]) {
          _results.push(element.attr('id', ''));
        } else {
          _results.push(ids[id] = element);
        }
      }
      return _results;
    };
    cleanWhitespace = function(content) {
      return content.find('.aloha-oer-ephemera-if-empty').each(function() {
        var $el;
        $el = jQuery(this);
        if ($el.text().trim().length) {
          return $el.removeClass('aloha-oer-ephemera-if-empty');
        } else {
          return $el.remove();
        }
      });
    };
    Aloha.ready(function() {
      return bindEvents(jQuery(document));
    });
    return Plugin.create('semanticblock', {
      defaults: {
        defaultSelector: 'div:not(.title,.aloha-oer-block,.aloha-editable,.aloha-block,.aloha-ephemera-wrapper,.aloha-ephemera)'
      },
      makeClean: function(content) {
        content.find('.semantic-container').each(function() {
          if (jQuery(this).children().not('.semantic-controls').length === 0) {
            return jQuery(this).remove();
          }
        });
        content.find(".aloha-oer-block").each(function() {
          return deactivate(jQuery(this));
        });
        cleanIds(content);
        return cleanWhitespace(content);
      },
      init: function() {
        var _this = this;
        return Aloha.bind('aloha-editable-created', function(e, params) {
          var $root, classes, selector, type, _i, _len;
          $root = params.obj;
          classes = [];
          for (_i = 0, _len = registeredTypes.length; _i < _len; _i++) {
            type = registeredTypes[_i];
            classes.push(type.selector);
          }
          selector = _this.settings.defaultSelector + ',' + classes.join();
          $root.find(selector).each(function() {
            if (!jQuery(this).parents('.semantic-drag-source').length) {
              return activate(jQuery(this));
            }
          });
          if ($root.is('.aloha-block-blocklevel-sortable') && !$root.parents('.aloha-editable').length) {
            jQuery('.semantic-drag-source').children().each(function() {
              var element, elementLabel;
              element = jQuery(this);
              elementLabel = (element.data('type') || element.attr('class')).split(' ')[0];
              return element.draggable({
                connectToSortable: $root,
                appendTo: jQuery('body'),
                revert: 'invalid',
                helper: function() {
                  var helper;
                  helper = jQuery(blockDragHelper).clone();
                  helper.find('.title').text(elementLabel);
                  return helper;
                },
                start: function(e, ui) {
                  $root.addClass('aloha-block-dropzone');
                  return jQuery(ui.helper).addClass('dragging');
                },
                refreshPositions: true
              });
            });
          }
          return setTimeout(function() {
            $root.sortable('option', 'stop', function(e, ui) {
              $root = jQuery(ui.item);
              if ($root.is(selector)) {
                return activate($root);
              }
            });
            return $root.sortable('option', 'placeholder', 'aloha-oer-block-placeholder aloha-ephemera', 500);
          });
        });
      },
      insertAtCursor: function(template) {
        var $element, range;
        $element = jQuery(template);
        range = Aloha.Selection.getRangeObject();
        $element.addClass('semantic-temp');
        GENTICS.Utils.Dom.insertIntoDOM($element, range, Aloha.activeEditable.obj);
        $element = Aloha.jQuery('.semantic-temp').removeClass('semantic-temp');
        return activate($element);
      },
      appendElement: function($element, target) {
        $element.addClass('semantic-temp');
        target.append($element);
        $element = Aloha.jQuery('.semantic-temp').removeClass('semantic-temp');
        return activate($element);
      },
      register: function(plugin) {
        registeredTypes.push(plugin);
        if (plugin.ignore) {
          return this.settings.defaultSelector += ':not(' + plugin.ignore + ')';
        }
      },
      registerEvent: function(name, selector, callback) {
        return pluginEvents.push({
          name: name,
          selector: selector,
          callback: callback
        });
      }
    });
  });

}).call(this);
