
define(

    ['ap/modules/view/widget/basewidget'],

    function (basewidget) {

        'use strict';

        var AgilePointWidgetsLogOut = basewidget.extend({
            onInit: function (AP, BlockId) {

                this.$Block
				.html(AP.View.Templates.renderTemplate('widget/logout',
													   { BlockId: BlockId }))
				.find('a')
				.on('click', function (e) {
				    AP.Controller.route('event/click', {
				        BlockId: BlockId,
				        e: e
				    });
				    return false;
				});
            }
        });

        return { name: 'LogOut', widget: AgilePointWidgetsLogOut };
    }
);
