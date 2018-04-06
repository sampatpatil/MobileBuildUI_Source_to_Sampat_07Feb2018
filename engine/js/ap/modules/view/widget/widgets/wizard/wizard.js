
define(

    [
        'ap/modules/view/widget/basewidget'
    ],

    function (basewidget) {

        'use strict';

        var AgilePointWizard = basewidget.extend({
            _getDefaultConfig: function () {
                return {};
            },
            onInit: function (AP, BlockId, block) {

                var Me = this, Config = this._config;

                var $Block = this.$Block;
                var $Blocks = this.$Blocks = $Block.find('.Blocks');
                /*var $Steps = $Blocks.find('.APWizardStep');       
     
                 $Steps
                 .find('a.k-button step-controller')
                 .on('click', function (e) {
     
                     if (!$(e.currentTarget).is(':disabled')) {
     
                         AP.Controller.route('event/step', {
                             BlockId: BlockId,
                             e: e,
                             CanRepeat: true
                         });
                     }
     
                     return false;
                 });*/


                //AP.Controller.Events.Model.onChangeCulture.add(this.translateTexts, this);
                this.translateTexts();
            },

            // -----------------------------------------------------------------------------------

            translateTexts: function () {
                var AP = this.AP;
                this.$Block
                .find('*[data-text-key]')
                .each(function () {

                    var $this = $(this),
                        KeyText = $this.attr('data-text-key'),
                        Text = AP.View.Internationalize.translate(KeyText);

                    $this.html(Text);
                });
            },

            destroy: function () {
                this.BlockModel = null;
            }
        });

        return { name: 'Wizard', widget: AgilePointWizard };
    }
)
