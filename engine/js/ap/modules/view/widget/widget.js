define(

    [
        'ap/modules/view/widget/widgets/clock',
        'ap/modules/view/widget/widgets/waiting',
        'ap/modules/view/widget/widgets/logout',
        'ap/modules/view/widget/widgets/breadcrumbs/breadcrumbs',
        'ap/modules/view/widget/widgets/image',
        'ap/modules/view/widget/widgets/mainmenu',
        'ap/modules/view/widget/widgets/pages',
        'ap/modules/view/widget/widgets/form/culture',
        'ap/modules/view/widget/widgets/metrocontent/metrocontent',
        'ap/modules/view/widget/widgets/metrocontent/metrocontentblock',
        'ap/modules/view/widget/widgets/metrocontent/widgetmetrocontent',
        'ap/modules/view/widget/widgets/toolbar/toolbar',
        'ap/modules/view/widget/widgets/grid/grid',
        'ap/modules/view/widget/widgets/messagebar',
        'ap/modules/view/widget/widgets/panelbar',
        'ap/modules/view/widget/widgets/splitter',
        'ap/modules/view/widget/widgets/reorderabletabstrip',
        'ap/modules/view/widget/widgets/background',
        'ap/modules/view/widget/widgets/grid/griddetail',
        'ap/modules/view/widget/widgets/grid/griddetailmodule',
        'ap/modules/view/widget/widgets/window',
        'ap/modules/view/widget/widgets/form/form',
        'ap/modules/view/widget/widgets/zoomview',
        'ap/modules/view/widget/widgets/slider',
        'ap/modules/view/widget/widgets/form/login',
        'ap/modules/view/widget/widgets/nav',
        'ap/modules/view/widget/widgets/button',
        'ap/modules/view/widget/widgets/togglebutton',
        'ap/modules/view/widget/widgets/menus/profilemenu',
        'ap/modules/view/widget/widgets/wizard/wizard',
        'ap/modules/view/widget/widgets/wizard/wizardstep',
        'ap/modules/view/widget/widgets/listview/listview',
        'ap/modules/view/widget/widgets/templatedWidget',
        'ap/modules/view/widget/widgets/viz/chart',
        'ap/modules/view/widget/widgets/viz/diagram',
        'ap/modules/view/widget/widgets/carousel',
        'ap/modules/view/widget/widgets/timer',
        'ap/modules/view/widget/widgets/menus/menu',
        'ap/modules/view/widget/widgets/treeview',
        'ap/modules/view/widget/widgets/xmlviewer',
        'ap/modules/view/widget/widgets/actioncenter/center',
        'ap/modules/view/widget/widgets/imageslider',
        'ap/modules/view/widget/widgets/form/rating',
        'ap/modules/view/widget/widgets/menus/css3menu',
        //'ap/modules/view/widget/widgets/menus/css3menuitem'
        
         
    ],

    function (

    ) {

        'use strict';

        var AP, repository = kendo.Class.extend({
            _repository: new Object,
            addWidgetDef: function (meta) {
                this._repository['AP' + meta.name] = meta;
            },
            removeWidgetDef: function (wname) {
                delete this._repository[wname];
            },
            getWidgetDef: function (wname) {
                return this._repository[wname];
            }
        });
        var buildWidgetRepository = function (widgets) {
            var repo = new repository();
            _.each(widgets, function (meta) {
                repo.addWidgetDef(meta);
            });

            return repo;
        };
        var AgilePointWidget = function (AgilePoint) {

            AP = AgilePoint;
        };

        AgilePointWidget.Repository = buildWidgetRepository(arguments);

        // Convert a View Block in Widget
        AgilePointWidget.prototype.widgetize = function (BlockId, WidgetType, NonViewModel) {

            var Block = NonViewModel || AP.Model.getBlock(BlockId),
                WidgetType = WidgetType || Block.get('Widget.Type'),
                $Block = $('#' + BlockId),
                meta = AgilePointWidget.Repository.getWidgetDef(WidgetType),
                Widget = meta && meta.widget;

            /* ClassPath debug */
            if (AP.Config.Data.ShowWidgetClassPath) {

                $Block.on('click', function () {
                    console.log('----------------------------------------------------------------');
                    console.log('Widget Type: ' + WidgetType);
                    console.log('Class Path: ' + AP.Utils.getClassPath(BlockId).join('/'));
                    return false;
                });
            }

            $Block.addClass('APWidget');

            if (!Widget) {
                var msg = kendo
                    .format("Widget of type: {0} cannot be found. Please verify the widget type defined in DNA file.", WidgetType);
                throw new Error(msg);
            }

            return new Widget(AP, BlockId, NonViewModel);
        };

        return AgilePointWidget;
    }
);