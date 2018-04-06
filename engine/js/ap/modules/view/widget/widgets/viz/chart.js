define(
[
     'ap/modules/view/widget/basewidgetwithtabstrip'
],

function (basewidgetwithtabstrip) {


    'use strict';

    var widget = basewidgetwithtabstrip.extend({
        KendoWidget: null,
        _getDefaultConfig: function () {
            var config = basewidgetwithtabstrip.fn._getDefaultConfig.call(this);
            return $.extend(true, {}, config, {
                refreshOnBind: false
            });
        },
        onInit: function (AP, BlockId) {
            //this.setup();    
            if (this._config.staticData)
                this.setup();
            else
                this.buildDatasource(null, this._config.autoRead);
        },
        _filtered: function () {
            //this.KendoWidget && this.KendoWidget.dataSource.data(this._dataSource.view());
            basewidgetwithtabstrip.fn._filtered.apply(this, arguments);
            this.renderCustomComponents();
        },
        onViewModelBind: function () {
            if (!this.KendoWidget || !this._config.refreshOnBind) return;
            var data = this.KendoWidget.dataSource.data();
            data && this.KendoWidget.refresh();
        },
        onDataChange: function (e) {
            var ds = this._dataSource, dat = e.items.toJSON ? e.items.toJSON() : e.items;

            if (dat && this._config.formatData) {

                var finalData = [], formatData = this._config.formatData;
                _.each(dat, function (dt) {
                    _.each(formatData.categories, function (cat, idx) {
                        var newData = {};
                        newData.category = cat;
                        newData.value = dt[cat];
                        if (formatData.categoryColors && formatData.categoryColors.length > idx)
                            newData.color = formatData.categoryColors[idx];
                        if (formatData.preserveFields) {
                            _.each(formatData.preserveFields, function (field) {
                                newData[field] = dt[field];
                            });
                        }
                        finalData.push(newData);
                    });
                });
                dat = finalData;
            }
            //this._dataSource.data(dat);

            this.KendoWidget && this.KendoWidget.dataSource.data(dat);
            this.renderCustomComponents();
        },
        renderCustomComponents: function () {
            var AP = this.AP, $wrapper = this.$Block.find('.chart-wrapper'),
                $title = $wrapper.find('.title'),
                $message = $wrapper.find('.defaultmessage'),
                $chart = $wrapper.find('.chart');
            if (!this.KendoWidget || !this.KendoWidget.dataSource) return;
            if (this.KendoWidget.dataSource.view().length == 0) {
                $message.html(this._config.defaultTemplate || '', { AP: AP, BlockId: this.BlockId, Config: this._config });
                $message.show();
                $title.hide(); $chart.hide();
            } else {
                $message.hide();
                $title.show(); $chart.show();
            }

            var others = this._config.others;
            if (others) {
                if (others.title) {
                    var title = '';
                    if (others.title.externalTemplate)
                        title = this.AP.View.Templates.renderTemplate(others.title.externalTemplate, { config: this._config, data: this._dataSource ? this._dataSource.view() : null });
                    else if (others.title.template)
                        title = this.AP.View.Templates.renderTemplate(others.title.template, { config: this._config, data: this._dataSource ? this._dataSource.view() : null });
                    $title.html(title);
                }
            }
        },
        _createDataSource: function (data) {
            this.buildDatasource(null, false);
            if (data) this._dataSource.data(data);
        },
        requeststart: function (e) {
            this.showProgress();
            basewidgetwithtabstrip.fn.requeststart.apply(this, arguments);
        },
        requestend: function (e) {
            this.hideProgress();
            this._setupChart(null, e);
        },
        setup: function (recreate) {
            if (recreate && this.KendoWidget) this.KendoWidget.destroy();
            if (!this.KendoWidget) {
                this.$Block.find('.chart-wrapper').remove();
                var $chart = this.$Block
                    .append('<div class="chart-wrapper"><div class="defaultmessage"></div><div class="title"></div><div class="chart"></div></div>')
                    .find('.chart');
                if (this._config.width) $chart.css('width', this._config.width);
                if (this._config.height) $chart.css('height', this._config.height);
                $chart.kendoChart(this._config); this.KendoWidget = $chart.data('kendoChart');
                this.KendoWidget && this.routeEvent('ready', {
                    CanRepeat: true
                });
                (!this._config.refreshOnBind) && $chart.removeAttr('data-role');
            }
        },
        _setupChart: function (d, r) {
            (!this._dataSource) && this._createDataSource();
            //this._config.dataSource = { data: dat };
            this.setup();
            //this.KendoWidget.dataSource.data(dat);
            //this.renderCustomComponents();
            this.KendoWidget && this.routeEvent('dataSourceSet', {
                dataSource: this.KendoWidget.dataSource,//this._dataSource,
                CanRepeat: true
            });
        },
        filter: function () {
            if (!this.KendoWidget || !arguments.length) return;
            this._filtering.apply(this, arguments);
            this.KendoWidget.dataSource.filter.apply(this.KendoWidget.dataSource, arguments);
            this._filtered.apply(this, arguments);
        },
        //_oldReadMethod: null,
        onDataSourceReady: function (d, r) {
            var me = this;
            if (!me._dataSource) return;
            // me._oldReadMethod = me._dataSource.transport.read;
            me._dataSource.transport = {
                read: function (args) {
                    args.success(args.data.response);
                    //me._dataSource.transport.read = me._oldReadMethod;
                }
            };
            this._dataSource.read({ response: r });
            //this._setupChart(d, r);
            //this.KendoWidget && this.KendoWidget.refresh();
        },
        redraw: function () {
            this.KendoWidget && this.KendoWidget.redraw();
        },
        refresh: function (extradata, rebuild) {
            if (!this.KendoWidget) return;
            if (rebuild)
            { this.buildDatasource(null, false); }
            this.KendoWidget.refresh();
        }
    });
    return { name: 'Chart', widget: widget };
});