define(
[
     'ap/modules/view/widget/basewidgetwithtabstrip'
],

function (basewidgetwithtabstrip) {


    'use strict';

    var widget = basewidgetwithtabstrip.extend({
        _diagram: null,
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
            //this._diagram && this._diagram.dataSource.data(this._dataSource.view());
            basewidgetwithtabstrip.fn._filtered.apply(this, arguments);
            this.renderCustomComponents();
        },
        onViewModelBind: function () {
            if (!this._diagram || !this._config.refreshOnBind) return;
            var data = this._diagram.dataSource.data();
            data && this._diagram.refresh();
        },
        onDataChange: function (e) {
            var ds = this._dataSource, items = this._dataSource.data(),
                dat = items.toJSON ? items.toJSON() : items;
            //this._dataSource.data(dat);

            this._diagram && this._diagram.dataSource.data(dat);
            this.renderCustomComponents();
            this._diagram && this._diagram.resize(true);
        },
        onTabActivated: function () {
            this._diagram && this._diagram.resize(true);
        },
        renderCustomComponents: function () {

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
            this._setupDiagram(null, e);
        },
        setup: function (recreate) {
            var me = this, deferred = $.Deferred();
            if (recreate && me._diagram) {
                me._diagram.destroy();
                me._diagram = null;
            }
            if (!me._diagram) {
                me.$Block.find('.diagram-wrapper').remove();
                var $diagram = me.$Block
                    .append('<div class="diagram-wrapper"><div class="defaultmessage"></div><div class="title"></div><div class="diagram"></div></div>')
                    .find('.diagram');
                if (me._config.width) $diagram.css('width', me._config.width);
                if (me._config.height) $diagram.css('height', me._config.height);

                if (me._config.shapeDefaults && me._config.shapeDefaults.visualTemplate) {
                    var moduleDef = me._config.shapeDefaults.visualTemplate;
                    me.showProgress();
                    require([moduleDef.module], function (renderers) {
                        me.hideProgress();
                        me._config.shapeDefaults.visual = renderers[moduleDef.fn];
                        $diagram.kendoDiagram(me._config);

                        me._diagram = $diagram.data('kendoDiagram');
                        me._diagram && me.routeEvent('ready', {
                            CanRepeat: true
                        });
                        deferred.resolve(me);
                    });
                } else {
                    $diagram.kendoDiagram(me._config);
                }


                me._diagram = $diagram.data('kendoDiagram');
                me._diagram && me.routeEvent('ready', {
                    CanRepeat: true
                });
                (!me._config.refreshOnBind) && $diagram.removeAttr('data-role');

            }

            if (me._diagram) deferred.resolve(me);

            return deferred.promise();
        },
        _setupDiagram: function (d, r) {
            var me = this;
            (!me._dataSource) && me._createDataSource();
            //this._config.dataSource = { data: dat };
            this.setup()
                .then(function () {
                    //this._diagram.dataSource.data(dat);
                    //this.renderCustomComponents();
                    me._diagram && me.routeEvent('dataSourceSet', {
                        dataSource: me._diagram.dataSource,//this._dataSource,
                        CanRepeat: true
                    });
                });
        },
        filter: function () {
            if (!this._diagram || !arguments.length) return;
            this._filtering.apply(this, arguments);
            this._diagram.dataSource.filter.apply(this._diagram.dataSource, arguments);
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
            //this._setupDiagram(d, r);
            //this._diagram && this._diagram.refresh();
        },
        refresh: function (extradata, rebuild) {
            if (!this._diagram) return;
            if (rebuild)
            { this.buildDatasource(null, false); }
            //this._diagram.refresh();
        }
    });
    return { name: 'Diagram', widget: widget };
});