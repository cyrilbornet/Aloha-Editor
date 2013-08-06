// Generated by CoffeeScript 1.5.0
(function() {

  define(['aloha', 'aloha/plugin', 'jquery', 'ui/ui', 'ui/button'], function(Aloha, Plugin, jQuery, UI, Button) {
    var buffer;
    buffer = '';
    return Plugin.create('copy', {
      buffer: function(content) {
        buffer = content;
        buffer = buffer.replace(/id="[^"]+"/, '');
        return jQuery('.action.paste').fadeIn('fast');
      },
      init: function() {
        console.log('loaded');
        return UI.adopt("paste", Button, {
          click: function() {
            var range;
            range = Aloha.Selection.getRangeObject();
            return GENTICS.Utils.Dom.insertIntoDOM(jQuery(buffer), range, Aloha.activeEditable.obj);
          }
        });
      }
    });
  });

}).call(this);