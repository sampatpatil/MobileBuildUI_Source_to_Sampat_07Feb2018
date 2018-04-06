
define(

    ['ap/modules/view/widget/basewidget'],

    function (basewidget) {

        'use strict';


        var AgilePointWidgetsProfileMenu = basewidget.extend({
            _getDefaultConfig: function () {
                return {
                    TargetSelector: '.ProfileIcon',
                    OpenClass: 'Opened'
                };
            },
            onInit: function (AP, BlockId) {
                this.AP = AP;
                var me = this;
                var $Block = this.$Block = AP.View.getBlock(BlockId), Block = AP.Model.getBlock(BlockId);
                var Widget = Block.get('Widget'), Config = this._config;
                this.BlockId = BlockId;
                var sel = Config.TargetSelector;

                var $actionElt = $Block.html(AP.View.Templates.renderTemplate(Widget.get('Template'), { AP: AP, BlockId: BlockId }))
                .find(sel);
                $actionElt.attr('data-action', Widget.get('Action'));
                var toggleHandler = function (e) {
                    var $menuItemsHolder = $('.MenuItemsHolder', $Block);
                    $menuItemsHolder.toggleClass(Config.OpenClass);
                    return false;

                };
                $(document).click(function (e) {
                    var $menuItemsHolder = $('.MenuItemsHolder', $Block);
                    if ($(e.target) != $actionElt) {
                        $menuItemsHolder.hasClass(Config.OpenClass) && $menuItemsHolder.removeClass(Config.OpenClass);
                    }
                    // Prevent the default behavior and stop propagation
                    e.stopPropagation();
                });

                $actionElt.on('click', toggleHandler);
                $Block.on('click', '.MenuItem', function (e) {
                    toggleHandler();
                    var $elt = $(e.target);
                    var action = $elt.data('action');
                    if (action) AP.Controller.route(action, { AP: AP, BlockId: BlockId });
                    me.routeEvent(action, {
                        BlockId: BlockId,
                        e: e
                    })
                });
                this._globalClickHandler = function (e) {
                    var $menuItemsHolder = $('.MenuItemsHolder', $Block);
                    $menuItemsHolder.hasClass(Config.OpenClass) && $menuItemsHolder.toggleClass(Config.OpenClass);
                    toggleHandler(e);
                }
                $(AP.View.$ViewRoot).on('click', this._globalClickHandler);
            },

            destroy: function () {
                $(this.AP.View.$ViewRoot).off('click', this._globalClickHandler);
                var Block = this.AP.Model.getBlock(this.BlockId);
                if (Block == null) return;
                this._config && this.$Block.off('click', this._config.TargetSelector);
            }
        });

        return { name: 'ProfileMenu', widget: AgilePointWidgetsProfileMenu };
    }
);
