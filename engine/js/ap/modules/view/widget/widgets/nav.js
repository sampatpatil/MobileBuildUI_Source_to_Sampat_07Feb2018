
define(

    ['ap/modules/view/widget/basewidget'],

    function (basewidget) {

        'use strict';

        var AgilePointNav = basewidget.extend({
            onInit: function (AP, BlockId) {

                this.BlockId = BlockId;
                this.$Block
                .html(AP.View.Templates.renderTemplate('widget/nav', { AP: AP, BlockId: BlockId }))
                .find('a')
                .on('click', function (e) {
                    AP.Controller.route('event/click', {
                        BlockId: BlockId,
                        e: e
                    });
                    return false;
                });
            },

            destroy: function () {
                this.$Block.find('a').off();
            }
        });

        return { name: 'Nav', widget: AgilePointNav };
    }
);
