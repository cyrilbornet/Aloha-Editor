// Generated by CoffeeScript 1.6.3
(function() {
  define(['aloha', 'aloha/plugin', 'jquery', 'ui/ui', 'ui/button', 'PubSub'], function(Aloha, Plugin, jQuery, UI, Button, PubSub) {
    var buffer;
    buffer = '';
    return Plugin.create('copy', {
      getBuffer: function() {
        if (localStorage) {
          return localStorage.alohaOerCopyBuffer;
        } else {
          return buffer;
        }
      },
      buffer: function(content) {
        buffer = content;
        buffer = buffer.replace(/id="[^"]+"/, '');
        if (localStorage) {
          localStorage.alohaOerCopyBuffer = buffer;
        }
        return jQuery('.action.paste').fadeIn('fast');
      },
      init: function() {
        var focusHeading, plugin,
          _this = this;
        plugin = this;
        jQuery('body').on('enable-action', '.action.paste,.action.copy', function(e) {
          e.preventDefault();
          return jQuery(this).fadeIn('fast');
        }).on('disable-action', '.action.paste,.action.copy', function(e) {
          e.preventDefault();
          return jQuery(this).fadeOut('fast');
        });
        focusHeading = null;
        PubSub.sub('aloha.selection.context-change', function(m) {
          if (m.range.startOffset === m.range.endOffset && jQuery(m.range.startContainer).parents('h1,h2,h3').length) {
            focusHeading = jQuery(m.range.startContainer).parents('h1,h2,h3').first();
            return _this.copybutton.enable();
          } else {
            return _this.copybutton.disable();
          }
        });
        this.pastebutton = UI.adopt('paste', Button, {
          tooltip: 'Paste',
          click: function(e) {
            var $elements, range;
            e.preventDefault();
            range = Aloha.Selection.getRangeObject();
            $elements = jQuery(plugin.getBuffer());
            return GENTICS.Utils.Dom.insertIntoDOM($elements, range, Aloha.activeEditable.obj);
          }
        });
        this.copybutton = UI.adopt("copy", Button, {
          click: function(e) {
            var $element, $elements, element, html, selector, _i, _len;
            e.preventDefault();
            $element = focusHeading;
            selector = "h1,h2,h3".substr(0, "h1,h2,h3".indexOf($element[0].nodeName.toLowerCase()) + 2);
            $elements = $element.nextUntil(selector).addBack();
            html = '';
            for (_i = 0, _len = $elements.length; _i < _len; _i++) {
              element = $elements[_i];
              html += jQuery(element).outerHtml();
            }
            return plugin.buffer(html);
          }
        });
        return Aloha.bind('aloha-editable-created', function() {
          if (localStorage && localStorage.alohaOerCopyBuffer) {
            return _this.pastebutton.enable();
          } else {
            return _this.pastebutton.disable();
          }
        });
      }
    });
  });

}).call(this);
