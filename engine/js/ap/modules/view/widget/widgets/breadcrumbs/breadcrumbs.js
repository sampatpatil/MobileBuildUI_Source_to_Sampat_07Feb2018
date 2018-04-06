
define(

    ['ap/modules/view/widget/basewidget'],

    function (basewidget) {

        'use strict';
        /*
            Show actual navigation path				
            binded to getBreadcrumbs dependant method of ViewModel
        */

        var AgilePointWidgetsBreadCrumbs = basewidget.extend({
            onInit: function (AP, BlockId) {
                this.$Block
				.html(AP.View.Templates.renderTemplate('widget/breadcrumbs/breadcrumbs',
													   { BlockId: BlockId }));
            }
        });

        return { name: 'BreadCrumbs', widget: AgilePointWidgetsBreadCrumbs };
    }
);
