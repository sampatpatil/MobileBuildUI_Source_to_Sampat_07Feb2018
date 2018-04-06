
define(

    ['ap/modules/view/widget/basewidget'],

    function (basewidget) {

        'use strict';

        var AgilePointWidgetsMetroContentBlock = basewidget.extend({
            _getDefaultConfig: function () {
                return {};
            },
            onInit: function (AP, BlockId) {

                var Block = AP.Model.getBlock(BlockId),
                    Widget = Block.get('Widget'),
                    Path = Widget.get('Config.Path'),
                    IsExternal = Widget.get('Config.External'),
                    DataAction = Widget.get('Config.DataAction'),
                    ContentPath = IsExternal ? Path : AP.Config.Data.RootPath + Path,
                    QueryId = Widget.get('QueryId'),
                    Size = Widget.get('Config.Size') || {},
                    Width = Size.Width ? 'Width_' + Size.Width : 'Width_1',
                    Height = Size.Height ? 'Height_' + Size.Height : 'Height_1';
                var qPath = 'State.Query.' + QueryId;

                if (!AP.Model.ViewModel.get(qPath)) {
                    AP.Model.ViewModel.set(qPath, AP.Config.Queries[QueryId]);
                }
                var DataSourceConfig = null;
                var vm = AP.Model.ViewModel.get(qPath);
                if (vm != null) {
                    // DataAction should be a part of DNA file.
                    //If in case it is not provided it will look in Query file as remedy.
                    if (DataAction == null) DataAction = vm.get('Config.DataAction');
                    DataSourceConfig = vm.get('Config.DataSourceConfig');
                }
                if (DataSourceConfig != null && DataAction != null) {
                    AP.Controller.route(DataAction, { AP: AP, QueryId: QueryId, DataSourceConfig: DataSourceConfig });
                }

                var FieldsHTML = AP.View.Templates.renderTemplate(Widget.get('Template') || 'widget/metrocontent/widgetmetrocontent', { BlockId: BlockId, QueryId: QueryId })
                this.$Block = $('#' + BlockId);


                // TODO load external content
                this.$Block
                .addClass(Width)
                .addClass(Height)
                .addClass('APMetroContentBlock')
                .addClass('MetroWidgetBlock').addClass(Block.get('Widget.Class') || '')
                .addClass('size' + Size.Width + Size.Height)
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

        return { name: 'WidgetMetroContentBlock', widget: AgilePointWidgetsMetroContentBlock };
    }
);
