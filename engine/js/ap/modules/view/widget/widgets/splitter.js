
define(

    [
        'ap/modules/view/widget/basewidget'
    ],

    function (basewidget) {

        'use strict';


        var AgilePointWidgetsSplitter = basewidget.extend({
            _getDefaultConfig:function(){

            },
            onInit: function (AgilePoint, BlockId) {

                var AP = AgilePoint, Me = this,
                    Block = AP.Model.getBlock(BlockId),
                    DefaultConfig = {
                        layoutChange: this.resizeChilds,
                        panes: this.getPanesConfig(Block)
                    },
                    Config = Block.get('Widget.Config') || {},
                    WidgetConfig = $.extend(DefaultConfig, Config);

                this.$Splitter = AP.View.getBlock(BlockId).find('> .Blocks');
                this._config = WidgetConfig;
                this.$Splitter.kendoSplitter(this._config);
                this.KendoWidget = this.$Splitter.data('kendoSplitter');

                // var t = setTimeout(function(){ Me.KendoWidget.trigger('resize'); }, 10);
            },
            getPanesConfig: function (Block) {

                var Panes = [],
                    Blocks = Block.get('Blocks'), AP = this.AP;

                for (var BlockIndex = 0; BlockIndex < Blocks.length; BlockIndex++) {

                    var BlockId = Blocks[BlockIndex],
                        Block = AP.Model.getBlock(BlockId),
                        BlockWidgetType = Block.get('Widget.Type');

                    Panes.push(this.getPaneConfig(BlockWidgetType));

                };
                return Panes;
            },

            getPaneConfig: function (BlockWidgetType) {

                var PaneConfig = {}, AP = this.AP;
                switch (BlockWidgetType) {

                    case 'APContextualToolBar':

                        PaneConfig = {
                            //size: AP.Less.barsheight,
                            scrollable: false,
                            resizable: false
                        };
                        break;
                }

                return PaneConfig;
            },

            resizeChilds: function () {

                $(this.element).find('.k-splitter').each(function () {

                    var KendoSplitter = $(this).data('kendoSplitter');
                    if (KendoSplitter) { KendoSplitter.trigger('resize'); }
                });
            }
        });





        return { name: 'Splitter', widget: AgilePointWidgetsSplitter };
    }
)
