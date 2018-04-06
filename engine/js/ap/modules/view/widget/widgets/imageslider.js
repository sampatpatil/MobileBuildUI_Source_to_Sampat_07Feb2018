
define(

    ['ap/modules/view/widget/basewidget', ],

    function (basewidget) {

        'use strict';

        var AgilePointWidgetsImage = basewidget.extend({

            _getDefaultConfig: function () {
                var AP = this.AP,
                   Me = this;
                return {
                    number: 5,
                    Data: []
                };
            },

            onInit: function (AP, BlockId) {
                var Me = this;
                var Block = AP.Model.getBlock(BlockId),
                   config = this._config;
                this.$Block
                .html(AP.View.Templates.renderTemplate('widget/image',
                                                       { AP: AP, BlockId: BlockId }));

                require(['slider'], function () {
                    Me.$Block.nivoSlider({
                        effect: 'random',
                        slices: 15,
                        boxCols: 8,
                        boxRows: 4,
                        animSpeed: 500,
                        pauseTime: 3000,
                        startSlide: 0,
                        directionNav: false,
                        controlNav: true,
                        controlNavThumbs: false,
                        pauseOnHover: true,
                        manualAdvance: false,
                        prevText: '',
                        nextText: '',
                        randomStart: false,
                        beforeChange: function () { },
                        afterChange: function () { },
                        slideshowEnd: function () { },
                        lastSlide: function () { },
                        afterLoad: function () { }
                    });
                });
            },

            destroy: function () {
                this.$Block.find('img').off();
            }
        });

        return { name: 'ImageSlider', widget: AgilePointWidgetsImage };
    }
);