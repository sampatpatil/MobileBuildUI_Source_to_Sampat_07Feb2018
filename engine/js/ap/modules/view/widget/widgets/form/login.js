define(

		[],

		function () {

		    'use strict';

		    var AgilePointWidgetsLogIn = function (AP, BlockId) {

		        AP.View.getBlock( BlockId).html(AP.View.Templates.renderTemplate('widget/menus/Login',
													   { BlockId: BlockId }))
                .find('.Button.OpenClose')
				.on('click', function () {
				    AP.Controller.route('state/Interface/toggle/mainmenuclosed', { CanRepeat: true });
				    return false;
				});

		        //.find('a')
		        //.on('click', function (e) {
		        //    AP.Controller.route('event/click', {
		        //        BlockId: BlockId,
		        //        e: e
		        //    });
		        //    return false;
		        //});
		    };

		    AgilePointWidgetsLogIn.prototype.destroy = function () {

		    };

		    return { name: 'Login', widget: AgilePointWidgetsLogIn };
		}
	);