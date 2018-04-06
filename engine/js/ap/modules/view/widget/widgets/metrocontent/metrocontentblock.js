
define(

    ['ap/modules/view/widget/basewidget'
    ],

    function (basewidget) {

        'use strict';

        var AgilePointWidgetsMetroContentBlock = basewidget.extend({
            _getDefaultConfig: function () {
                return { Path: '', IsExternal: false, Size: {} };
            },
            onInit: function (AP, BlockId) {

                var Block = AP.Model.getBlock(BlockId),
                    Widget = Block.get('Widget'),
                    ConfigPath = this._config.Path,
                    IsExternal = this._config.External,
                    ContentPath = IsExternal ? Path : AP.Config.Data.RootPath + ConfigPath,
                    Size = this._config.Size,
                    Width = Size.Width ? 'Width_' + Size.Width : 'Width_1',
                    Height = Size.Height ? 'Height_' + Size.Height : 'Height_1',
                    BackgroundImageClass = this._config.BackgroundImage ? 'Block' + Size.Height + Size.Width + this._config.BackgroundImage : 'Block11n';

                var FieldsHTML = AP.View.Templates.renderTemplate(Widget.get('Template') || 'widget/metrocontent/metrodatacontent', { BlockId: BlockId })
                
                // TODO load external content
                this.$Block
                .addClass(Width)
                .addClass(Height)
                .addClass('size' + Size.Width + Size.Height)
                .addClass(Widget.get('Class') || '')
                .addClass(BackgroundImageClass)
                .prepend(FieldsHTML);

                //.append(AP.View.Templates.renderTemplate(ContentPath));
                //.load(ContentPath);

                AP.Controller.Events.Model.onChangeCulture.add(this.translateTexts, this);
                this.translateTexts();
            },

            translateTexts: function () {
                var AP = this.AP;
                this.$Block.find('*[data-text-key]')
                .each(function () {

                    var $this = $(this),
                        KeyText = $this.attr('data-text-key'),
                        Text = AP.View.Internationalize.translate(KeyText);

                    $this.html(Text);
                });
            }
        });


        return { name: 'MetroContentBlock', widget: AgilePointWidgetsMetroContentBlock };
    }
);
