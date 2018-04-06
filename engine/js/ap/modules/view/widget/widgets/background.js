
define(

    ['ap/modules/view/widget/basewidget'],

    function (basewidget) {

        'use strict';


        var AgilePointWidgetsBackground = basewidget.extend({
            onInit: function (AP, BlockId) {
                this.$Block
                .prepend(AP.View.Templates.renderTemplate('widget/background',
                                                          { BlockId: BlockId }));
            }
        });

        return { name: 'Background', widget: AgilePointWidgetsBackground };
    }
);
