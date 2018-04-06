
define(

    ['ap/modules/view/widget/basewidget'],

    function (basewidget) {

        'use strict';

        var AgilePointWidgetsImage = basewidget.extend({
            onInit: function (AP, BlockId) {
                this.$Block
                .html(AP.View.Templates.renderTemplate('widget/image',
                                                       { AP: AP, BlockId: BlockId }))
                .find('img')
                .on('click', function (e) {
                    AP.Controller.route('event/click', {
                        BlockId: BlockId,
                        e: e
                    });
                    return false;
                });
            },

            destroy: function () {

                this.$Block.find('img').off();
            }
        });

        return { name: 'Image', widget: AgilePointWidgetsImage };
    }
);
