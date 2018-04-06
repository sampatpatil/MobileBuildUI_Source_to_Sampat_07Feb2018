define(

		[],

		function () {

		    'use strict';

		    var AgilePointWidgetsCulture = function (AP, BlockId) {

		        var Block = AP.Model.getBlock(BlockId),
                    Config = Block.get('Widget.Config') || {};
		        this.AP = AP;
		        var $Block = $('#' + BlockId);
		        var ddl = $Block.html(AP.View.Templates.renderTemplate('widget/menus/culture',
                                                         { BlockId: BlockId, AP: AP }))
                  .find('#options')
                  .kendoDropDownList({
                      dataTextField: "text",
                      dataValueField: "value",
                      dataSource: Block.Widget.Config.Data,
                      index: 0,
                      select: $.proxy(this.select, this)
                  }).data('kendoDropDownList');
		        ddl.select(function (item) {
		            return item.value == $.cookie('i18next');
		        });
		    };

		    AgilePointWidgetsCulture.prototype.select = function (e) {

		        var Item = e.item,
					$Item = $(Item),
					BlockId = $Item.attr('data-id');

		        var dataItem = e.sender.dataItem(e.item.index());
		        this.AP.Controller.route('setculture/' + dataItem.value);
		    };

		    AgilePointWidgetsCulture.prototype.destroy = function () {

		    };

		    return { name: 'SetCulture', widget: AgilePointWidgetsCulture };
		}
	);