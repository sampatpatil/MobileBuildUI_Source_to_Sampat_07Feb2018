
define(

    [
        'ap/modules/view/widget/basewidget', 'async', 'lib/modules/menuex'
    ],

    function (basewidget, async) {

        'use strict';

        // Create a Open/Close menu with a button that add/remove viewmodel/state/mainmenuopen'

        var AgilePointWidgetsMainMenu =

          basewidget.extend({
              _getDefaultConfig: function () {
                  return { hoverDelay: 2000 };
              },
              _getAnimDuration: function () {
                  return this._config.hoverDelay / 3;
              },
              onInit: function (AP, BlockId) {

                  var me = this;

                  me.$Block.append(AP.View.Templates.renderTemplate('widget/menus/mainmenu', { AP: AP, BlockId: BlockId })) // Add open/close button
                  .find('.Button.OpenClose')
                  .on('click', function () {
                      AP.Controller.route('state/Interface/toggle/mainmenuclosed', { CanRepeat: true });
                      return false;
                  });
                  return;
                  //TODO: remove this code once css3menu integration is complete.
                  var _openTimer, handlers = {
                      click: function () {
                          var $elt = $(this);
                          $elt.finish().css({ width: 205 });
                      },
                      mouseenter: function (e) {
                          var $elt = $(this);
                          _openTimer = setTimeout(function () {
                              var duration = me._getAnimDuration();
                              if (!AP.View.isMainMenuOpen()) {
                                  $elt.find('.MenuText')
                                      .animate({ opacity: 1, wordwrap: 'normal' }, {
                                          duration: duration, completed: function () {
                                              me._checkItems();
                                              me._openMenuSection($elt);
                                          }
                                      });
                                  $elt.animate({ width: 205 }, { duration: duration });

                              }
                          }, me._config.hoverDelay / 2);
                      },
                      mouseleave: function () {
                          var $elt = $(this);
                          clearTimeout(_openTimer);

                          if (!AP.View.isMainMenuOpen()) {
                              var duration = me._getAnimDuration();
                              $elt.animate({ width: 64 }, {
                                  duration: duration, completed: function () {
                                      me._checkItems();
                                      async.nextTick(function () {
                                          me._closeMenuSection($elt);
                                      });
                                  }
                              });
                              $elt.find('.MenuText').animate({ opacity: 0, wordwrap: 'normal' }, { duration: duration });
                          }
                      }
                  };

                  me.$Block.on('click mouseenter mouseleave', '.k-item.ForceDisplay', function (e) {
                      //handlers[e.type].apply(this, arguments);
                  });

                  me.translateTexts();
                  setTimeout(function () {
                      me._checkItems();
                  }, 500);
              }, destroy: function () {
                  this._config && this._config.overlaySelector && this.$Block.siblings(this._config.overlaySelector).remove();
                  basewidget.fn.destroy.apply(this, arguments);
                  this.$Block.remove();
              },
              _getMenu: function () {
                  return this.$Block.find('.APCSS3Menu').data('css3menu');
              },
              _openMenuSection: function ($section) {
                  var menu = this._getMenu();
                  menu && menu.open($section);
              },
              _closeMenuSection: function ($section) {
                  var menu = this._getMenu();
                  menu && menu.close($section);
              },
              _checkItems: function () {
                  var $items = this.$Block.find('.k-item.ForceDisplay');
                  if (this.AP.View.isMainMenuOpen()) $items.removeAttr('style')
                      .find('.MenuText').removeAttr('style');
                  else $items.css({ width: '64px' });
              },
              onMainMenuStateChanged: function (opened) {
                  //this._checkItems();
                  var menu = this._getMenu();
                  menu && (opened  ? menu.expand() : menu.collapse());
              }
          });

        return { name: 'MainMenu', widget: AgilePointWidgetsMainMenu };
    }
);
