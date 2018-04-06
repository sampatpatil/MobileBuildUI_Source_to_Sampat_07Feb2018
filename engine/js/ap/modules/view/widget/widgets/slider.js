
define(

    [
        'ap/modules/view/widget/basewidget'
    ],

    function (basewidget) {

        'use strict';
        var AgilePointWidgetsSlider = basewidget.extend({
            onInit: function (AP, BlockId, NonViewModel) {

                var Me = this,
					Block = AP.Model.getBlock(BlockId),
					DefaultConfig = {
					    orientation: 'horizontal',
					    tickPlacement: 'none',
					    min: NonViewModel ? NonViewModel.min || 0 : 0,
					    max: NonViewModel ? NonViewModel.max || 100 : 100,
					    tooltip: {
					        format: '{0}%'
					    },
					    change: this.change,
					    slide: this.slide
					},
					Config = Block ? Block.get('Widget.Config') || {} : {},
					WidgetConfig = $.extend(DefaultConfig, Config);

                this.$Block = $('#' + BlockId);

                this.$Block.append(AP.View.Templates.renderTemplate('widget/slider', NonViewModel));
                this.$Slider = this.$Block.find('input');

                this.$Slider.kendoSlider(WidgetConfig);
                this.KendoWidget = this.$Slider.data('kendoSlider');
            },

            change: function (e) {

                console.log('change ' + e);
            },

            slide: function (e) {

                console.log('slide ' + e);
            },

            destroy: function () {

                this.KendoWidget && this.KendoWidget.destroy();
            }
        });

        return { name: 'Slider', widget: AgilePointWidgetsSlider };
    }
)
