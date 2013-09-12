// Generated by CoffeeScript 1.5.0
(function() {

  define(['jquery', 'aloha', 'aloha/plugin', 'PubSub', 'ui/button'], function(jQuery, Aloha, Plugin, PubSub, Button) {
    var $ROOT, adoptedActions, buildMenu, formats, makeItemRelay, squirreledEditable;
    squirreledEditable = null;
    $ROOT = jQuery('body');
    makeItemRelay = function(slot) {
      var ItemRelay;
      ItemRelay = (function() {

        function ItemRelay() {}

        ItemRelay.prototype.show = function() {
          return $ROOT.find(".action." + slot).removeClass('hidden');
        };

        ItemRelay.prototype.hide = function() {};

        ItemRelay.prototype.setActive = function(bool) {
          if (!bool) {
            $ROOT.find(".action." + slot).removeClass('active');
          }
          if (bool) {
            return $ROOT.find(".action." + slot).addClass('active');
          }
        };

        ItemRelay.prototype.setState = function(bool) {
          return this.setActive(bool);
        };

        ItemRelay.prototype.enable = function(bool) {
          var btn, evt;
          if (bool == null) {
            bool = true;
          }
          btn = $ROOT.find(".action." + slot);
          evt = $.Event(bool && 'enable-action' || 'disable-action');
          btn.trigger(evt);
          if (evt.isDefaultPrevented()) {
            return;
          }
          if (btn.is('.btn')) {
            if (bool) {
              return btn.removeAttr('disabled');
            } else {
              return btn.attr('disabled', 'disabled');
            }
          } else {
            if (bool) {
              return btn.parent().removeClass('disabled');
            } else {
              return btn.parent().addClass('disabled');
            }
          }
        };

        ItemRelay.prototype.disable = function() {
          return this.enable(false);
        };

        ItemRelay.prototype.setActiveButton = function(a, b) {
          return console && console.log("" + slot + " TODO:SETACTIVEBUTTON:", a, b);
        };

        ItemRelay.prototype.focus = function(a) {
          return console && console.log("" + slot + " TODO:FOCUS:", a);
        };

        ItemRelay.prototype.foreground = function(a) {
          return console && console.log("" + slot + " TODO:FOREGROUND:", a);
        };

        return ItemRelay;

      })();
      return new ItemRelay();
    };
    adoptedActions = {};
    Aloha.bind('aloha-ready', function(event, editable) {
      return jQuery.each(adoptedActions, function(slot, settings) {
        var selector;
        selector = ".action." + slot;
        $ROOT.on('click', selector, function(evt) {
          var $target;
          evt.preventDefault();
          Aloha.activeEditable = Aloha.activeEditable || squirreledEditable;
          $target = jQuery(evt.target);
          if (!($target.is(':disabled') || $target.parent().is('.disabled'))) {
            this.element = this;
            return settings.click.bind(this)(evt);
          }
        });
        if (settings.preview) {
          $ROOT.on('mouseenter', selector, function(evt) {
            var $target;
            $target = jQuery(evt.target);
            if (!($target.is(':disabled') || $target.parent().is('.disabled'))) {
              return settings.preview.bind(this)(evt);
            }
          });
        }
        if (settings.unpreview) {
          return $ROOT.on('mouseleave', selector, function(evt) {
            var $target;
            $target = jQuery(evt.target);
            if (!($target.is(':disabled') || $target.parent().is('.disabled'))) {
              return settings.unpreview.bind(this)(evt);
            }
          });
        }
      });
    });
    formats = {};
    buildMenu = function(options, selected) {
      var $container, label, tag;
      $container = $ROOT.find('.headings ul');
      $container.empty();
      for (tag in options) {
        label = options[tag];
        $container.append("<li><a href=\"#\" class=\"action changeHeading\" data-tagname=\"" + tag + "\">" + label + "</a></li>");
      }
      return $ROOT.find('.headings .currentHeading').text(formats[selected]);
    };
    /*
     register the plugin with unique name
    */

    return Plugin.create("toolbar", {
      defaults: {
        defaultFormat: 'p',
        formats: {
          'p': 'Normal Text',
          'h1': 'Heading',
          'h2': 'Subheading',
          'h3': 'SubSubHeading',
          'pre': 'Code'
        }
      },
      init: function() {
        var changeHeading, toolbar;
        toolbar = this;
        formats = this.settings.formats;
        jQuery.extend(toolbar.settings, this.defaults);
        changeHeading = function(evt) {
          var $el, $newEl, $oldEl, hTag, rangeObject;
          evt.preventDefault();
          $el = jQuery(this);
          hTag = $el.attr('data-tagname');
          rangeObject = Aloha.Selection.getRangeObject();
          if (rangeObject.isCollapsed()) {
            GENTICS.Utils.Dom.extendToWord(rangeObject);
          }
          Aloha.Selection.changeMarkupOnSelection(Aloha.jQuery("<" + hTag + "></" + hTag + ">"));
          jQuery('.currentHeading')[0].innerHTML = $el[0].innerHTML;
          $oldEl = Aloha.jQuery(rangeObject.getCommonAncestorContainer());
          $newEl = Aloha.jQuery(Aloha.Selection.getRangeObject().getCommonAncestorContainer());
          return $newEl.addClass($oldEl.attr('class'));
        };
        $ROOT.on('click', '.action.changeHeading', changeHeading);
        $ROOT.on('mousedown', ".action", function(evt) {
          return evt.stopPropagation();
        });
        Aloha.bind('aloha-editable-activated', function(event, data) {
          return squirreledEditable = data.editable;
        });
        return PubSub.sub('aloha.selection.context-change', function(data) {
          var allowedFormats, blacklist, currentHeading, el, label, parents, tag, whitelist;
          el = data.range.commonAncestorContainer;
          parents = $(el).parents().andSelf();
          currentHeading = parents.filter(Object.keys(formats).join(',')).first();
          blacklist = [];
          parents.filter('[data-format-blacklist]').each(function() {
            return blacklist += jQuery(this).data('formatBlacklist');
          });
          whitelist = [];
          parents.filter('[data-format-whitelist]').each(function() {
            return whitelist += jQuery(this).data('formatWhitelist');
          });
          allowedFormats = [];
          for (tag in formats) {
            label = formats[tag];
            if ((!blacklist.length || blacklist.indexOf(tag) === -1) && (!whitelist.length || whitelist.indexOf(tag) !== -1)) {
              allowedFormats[tag] = label;
            }
          }
          if (currentHeading.length) {
            currentHeading = currentHeading.get(0).tagName.toLowerCase();
          } else {
            currentHeading = toolbar.settings.defaultFormat;
          }
          return buildMenu(allowedFormats, currentHeading);
        });
      },
      childVisible: function(childComponent, visible) {
        var evt;
        evt = $.Event('aloha.toolbar.childvisible');
        evt.component = childComponent;
        evt.visible = visible;
        return PubSub.pub(evt.type, evt);
      },
      childFocus: function(childComponent) {
        var evt;
        evt = $.Event('aloha.toolbar.childfocus');
        evt.component = childComponent;
        return PubSub.pub(evt.type, evt);
      },
      childForeground: function(childComponent) {
        var evt;
        evt = $.Event('aloha.toolbar.childforeground');
        evt.component = childComponent;
        return PubSub.pub(evt.type, evt);
      },
      adopt: function(slot, type, settings) {
        var evt;
        evt = $.Event('aloha.toolbar.adopt');
        $.extend(evt, {
          params: {
            slot: slot,
            type: type,
            settings: settings
          },
          component: null
        });
        PubSub.pub(evt.type, evt);
        if (evt.isDefaultPrevented()) {
          evt.component.adoptParent(toolbar);
          return evt.component;
        }
        adoptedActions[slot] = settings;
        return makeItemRelay(slot);
      },
      /*
       toString method
      */

      toString: function() {
        return "toolbar";
      }
    });
  });

}).call(this);
