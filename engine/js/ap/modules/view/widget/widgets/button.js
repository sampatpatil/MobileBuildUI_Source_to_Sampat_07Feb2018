
define(['ap/modules/view/widget/basewidget'],
    function (baseWidget) {

        'use strict';

        var AgilePointWidgetsButton = baseWidget.extend({
            onInit: function (AgilePoint, BlockId) {

                var AP = AgilePoint, Me = this;
                this.AP = AP;
                var Block = AP.Model.getBlock(BlockId);
                var Widget = Block.get('Widget');
                this.BlockId = BlockId;
                Widget.set('DOM', Widget.get('DOM') || 'button');
                var $actionElt = $('#' + BlockId).html(AP.View.Templates.renderTemplate('widget/button', { AP: AP, BlockId: BlockId }))
                .find(Widget.get('DOM'));
                $actionElt.attr('data-action', Widget.get('Action'));
                $actionElt.on('click', function (e) {
                    Me.routeEvent('click', {
                        BlockId: BlockId,
                        e: e
                    });
                    return false;
                });

                //Ensuring that destroy function does not loose it's context when it is called.
                this.destroy.bind(this);
                //if (Block.Blocks != null) {
                //    for (var i = 0; i < Block.Blocks.length; i++) {
                //        AP.Model.addNewBlock(AP.Model.getBlock(Block.Blocks[i]), BlockId);
                //    }
                //}

            }, destroy: function () {
                var Block = this.AP.Model.getBlock(this.BlockId);
                if (Block == null) return;
                var Widget = Block.get('Widget');
                if (Widget == null) return;
                $('#' + this.BlockId).find(Widget.get('DOM')).off(this.BlockId);
                baseWidget.fn.destroy.apply(this, arguments);
            }
        });

        return { name: 'Button', widget: AgilePointWidgetsButton };
    }
);
