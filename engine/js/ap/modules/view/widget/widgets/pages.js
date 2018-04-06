
define(

    [
        'ap/modules/view/widget/basewidget'
    ],

    function (basewidget) {

        'use strict';
        var AgilePointWidgetsPages = basewidget.extend({
            onInit: function (AP, BlockId) {
                this.$Block
                .append(AP.View.Templates.renderTemplate('widget/pages', { BlockId: BlockId }));
            }
        });

        return { name: 'Pages', widget: AgilePointWidgetsPages };
    }
);
