
define(
[
    'async',
    'ap/modules/view/widget/basewidgetwithtabstrip',
    'lib/modules/jquery.transform2d',
    'lib/modules/verticalStack'],

function (async, baseWidgetWithTabstrip) {


    'use strict';

    var carouselWidget = baseWidgetWithTabstrip.extend({
        _dataSrcConfig: {}, $BlockSlot: null, CustomWidget: null, _data: null, rawData: null,
        _getDefaultConfig: function () {
            return {
                autoRead: false,
                ajaxRequestEnabled: true,
                loadingTemplate: '<div class="k-loading-image"></div>',
                hasImages: false,
                refreshBinding: true,
                itemContainer: 'div',
                itemsContainer: 'div',
                itemSelector: '.CarouselItem'
            };
        },
        onInit: function (AP, BlockId) {
            var Block = AP.Model.getBlock(BlockId);

            this.$BlockSlot = this.$Block.find('> .Blocks');

            if (this.QueryId) {
                if (_.isObject(this._config.loadingTemplate)) {
                    this._config.loadingTemplate = AP.View.Templates.renderTemplate(this._config.loadingTemplate, Block);
                }
                this.$Block.html('<' + this._config.itemsContainer + ' class="Blocks"></' + this._config.itemsContainer + '>');
                this.$BlockSlot = this.$Block.find('> .Blocks');
                this.buildDatasource(null, this._config.autoRead);
            }
            else this.setup();
            this._config.startHidden && this.hide();
        },
        _createDataSource: function (data) {
            this.buildDatasource(null, false);
            if (data) this._dataSource.data(data);
        },
        setData: function (data) {
            this.onDataSourceReady(null, { response: data });
        },
        onDataChange: function () {
            this._renderSetup(this._dataSource.view(), false);
        },
        onDataSourceReady: function (d, r) {
            this._createDataSource();
            /*var ds = this._dataSource, dat = r;
            if (this._dataSource) {
                if (this._dataSource.reader && this._dataSource.reader.parse)
                    dat = this._dataSource.reader.parse(r);
                this._dataSource.data(dat);
            }
            this._renderSetup(dat, true);*/
            this._simulateRead({ response: r });
        },
        _renderSetup: function (dat, fireSettingDataSource) {
            this._renderItems(dat);
            //this._config.dataSource = { data: dat };
            this.setup();
            if (fireSettingDataSource)
                this.routeEvent('dataSourceSet', {
                    data: dat,
                    dataSource: this._dataSource,
                    CanRepeat: true
                });
        },
        getSelectedItem: function () {
            var me = this, selected = this.CustomWidget.select();

            return selected ? _.find(me._data, function (i) { return i[me._config.idField] == $(selected[0]).data('id') }) : null;
        },
        refresh: function () {
            if (this._dataSource) this._dataSource.read();
        },
        setup: function (forceShow) {
            //if (this.CustomWidget) this.CustomWidget.destroy();
            if (forceShow) this.show();
            var me = this;
            //this.CustomWidget = this.$BlockSlot.roundabout(this._config.toJSON());
            //this.$BlockSlot.waterwheelCarousel(this._config);
            me.AP.Controller.route('bind', { notifyOnlyTarget: true, target: me.$Block });
            if (me.CustomWidget) { me.CustomWidget.refresh(me._config); return; }
            me.$BlockSlot.verticalStack(this._config);
            me.CustomWidget = this.$BlockSlot.data('verticalStack');
            me.$BlockSlot.off('beforeSwitch');
            me.$BlockSlot.off('afterSwitch');
            me.$BlockSlot.on('beforeSwitch', $.proxy(me._beforeSwitch, me));
            me.$BlockSlot.on('afterSwitch', $.proxy(me._afterSwitch, me));
            me.$BlockSlot.on('buttonClick', $.proxy(me._raiseClick, me));
            //this._config.refreshBinding &&
          
        },
        _raiseClick: function (args) {
            var $elt = $(args.e.delegateTarget);
            this.routeEvent('click', { event: args, e: args.e, data: _.findWhere(this._data || [], { uid: $elt.attr('data-id') }) });
        },
        _beforeSwitch: function (args) {
            this.routeEvent('beforeSwitch', { event: args, e: args });
        },
        _afterSwitch: function (e) {
            this.routeEvent('afterSwitch', { index: e.active.index(), e: e, activeData: _.findWhere(this._data || [], { uid: e.active.attr('data-id') }) });
        },
        requeststart: function () {
            this.$BlockSlot.html(this._config.loadingTemplate);
        },
        _renderItems: function (data) {
            this.$BlockSlot.html(this.AP.View.Templates.renderTemplate('widget/carousel/items', {
                AP: this.AP, items: this._data = data, config: this._config
            }));
        },
        requestend: function (e) {
            if (!this._config.ajaxRequestEnabled) return;
            this.rawData = e.response;
            //this._renderItems(this._dataSource.options.schema.parse(e.response));

        }
    });
    return { name: 'Carousel', widget: carouselWidget };
});
