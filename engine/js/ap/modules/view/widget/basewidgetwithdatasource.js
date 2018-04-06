define(

    [
         'ap/modules/view/widget/basewidget',
         'lib/modules/utilities'
    ],

    function (baseWidget, utils) {

        'use strict';



        var BaseWidgetWithDatasource = baseWidget.extend({
            _dataSource: null, QueryId: '', _query: null, isDependent: false,
            _getDefaultConfig: function (config) {
                return {
                    hierarchical: false,
                    /*When set to true the widget will not be expecting data from dataSource*/
                    staticData: false
                };
            },
            preOnInit: function (AP, BlockId) {
                var Block = AP.Model.getBlock(BlockId);
                if (Block) { this.QueryId = Block.get('Widget.QueryId') || ''; this.isDependent = Block.get('Widget.IsDependent') || false; }
                this.$Block.attr('data-query-id', this.QueryId);
                this.addEvent('requeststart', 'requestend', 'filtering', 'filtered');
            },
            destroy: function () {
                baseWidget.fn.destroy.apply(this, arguments);
                this._dataSource && this._dataSource.unbind();
                this._dataSource = null;
            },
            _filtering: function () {
                this.trigger('filtering', arguments);
            },
            _filtered: function () {
                this.trigger('filtered', arguments);
            },
            postOnInit: function (AP, BlockId, BlockModel) {
                var Block = AP.Model.getBlock(BlockId) || BlockModel;
                var rq; Block && Block.Widget && Block.Widget.Config && (rq = Block.Widget.Config.hasReadyMadeQuery); var vm = AP.Config.loadQuery(this.QueryId);
                if (rq) {
                    var response = { response: vm.ReadyMadeData };
                    utils.invokeAsync(function (r) { this.onDataSourceReady(r, r); }, this, [response]);
                }
            },
            requeststart: function () {

            },
            requestend: function () {

            },
            dataBound: function () {

            },
            onDataChange: function () {

            },
            _setTitle: function () {
                if (!this._query) return;
                var q = this._query, AP = this.AP, hasFields = '';
                var CompoundDataSource = AP.Model.DataSource.getDataSource(q),
                        QueryData = CompoundDataSource.QueryData,
                        DataSource = CompoundDataSource.DataSource,
                    QueryDataForTitle = AP.Model.DataSource.adaptQueryDataForDataSource(q.Form);

                /* Set Grid Title */
                if (QueryDataForTitle.APTitle) {

                    AP.Utils.setBlockTitle(this.$Block, QueryDataForTitle.APTitle);
                    hasFields = 'HasFields';
                    this.$Block.addClass(hasFields)
                } else {
                    hasFields = null;
                    this.$Block.removeClass(hasFields)
                }
            },
            _refreshQuery: function (ExtraData) {

                var AP = this.AP, AppQuery = AP.Config.getQuery(this.QueryId), vmPath = 'State.Query.' + this.QueryId,
                    SavedQuery = AP.Config.loadQuery(this.QueryId), // All queries are saved in ModelView State
                    SavedQuery = SavedQuery ? SavedQuery.toJSON() : {};

                this._query = $.extend(true, {}, AppQuery, SavedQuery, ExtraData);
                AP.Model.ViewModel.set(vmPath, this._query); // Actualize saved query				
            },
            _getDataSourceConfig: function () {
                return {
                    dataBound: $.proxy(function () { this.dataBound.apply(this, arguments); }, this),
                    requestStart: $.proxy(function (E) {
                        this.requeststart.apply(this, arguments);
                        this.trigger('requeststart', arguments);
                    }, this),
                    requestEnd: $.proxy(function (E) {
                        this.requestend(E);
                        this.trigger('requestend', arguments);
                    }, this),
                    error: $.proxy(function (E) { this.error(E); }, this)
                };
            },
            _generateDataSourceConfig: function (data) {
                return this.AP.Model.DataSource.getDataSource(this._query, data).DataSource
            },
            _mergeDataSourceConfig: function (ConfigDataSource, ModuleDataSource) {
                return $.extend(true, ConfigDataSource, ModuleDataSource);
            },
            _buildDataSourceConfig: function (extradata) {
                var ConfigDataSource = this._getDataSourceConfig(),
                    ModuleDataSource = this._generateDataSourceConfig(extradata);
                return this._mergeDataSourceConfig(ConfigDataSource, ModuleDataSource);
            },
            _initQuery: function () {
                var vmPath = 'State.Query.' + this.QueryId, AP = this.AP;
                AP.Config.loadQuery(this.QueryId);
                this._refreshQuery();
                this.ObservableData = AP.Config.loadQuery(this.QueryId);
            },
            notifyDependables: function (data, response) {
                var AP = this.AP, me = this, block = AP.Model.getBlock(this.BlockId),
                  queries = block.get('Widget.Dependables.Queries');
                if (!queries) return;
                var d = data, r = response;
                _.each(queries, function (q) {
                    _.each(AP.View.$ViewRoot.find('.APWidget[data-query-id="' + q + '"]').not(me.$Block), function (elt) {
                        var $elt = $(elt), widget = $elt.data('APWidget');
                        if (widget && widget.onDataSourceReady) widget.onDataSourceReady(d, r);
                    });
                });
            },
            onDataSourceReady: function () {
            },
            _onDataReady: function (data) {
                if (!this._dataSource) return;
                this._dataSource.data(data);
                this.onDataSourceReady();
            },
            filter: function () {
                this._dataSource && this._dataSource.filter.apply(this._dataSource, arguments);
            },
            _createNewDataSource: function (config) {
                return new ((this._config && this._config.hierarchical) ? kendo.data.HierarchicalDataSource : kendo.data.DataSource)(config);
            },
            buildDatasource: function (extradata, read) {
                var me = this;
                read = read == null || read;
                me._initQuery();
                //this.ObservableData.generateQuery(Module.Data);

                var config;
                if (this._config.staticData) config = this._config.dataSource;
                else config = this._buildDataSourceConfig(extradata);

                me._dataSource = this._createNewDataSource(config);
                me._dataSource.bind('change', function () { me.onDataChange.apply(me, arguments); });

                me._dataSource.filter = function () {
                    if (!arguments.length) return;
                    // If a column is about to be filtered, then raise a new "filtering" event.
                    me._filtering(arguments);
                    // Call the original filter function.
                    var result = kendo.data.DataSource.fn.filter.apply(this, arguments);
                    me._filtered(arguments);
                    return result;
                };
                if (read) this._dataSource.read();
                me.onAfterBuildDataSource();
            }, onAfterBuildDataSource: function () {

            },
            _simulateRead: function (r, read) {
                this._dataSource && (this._dataSource.transport.read =
                     read || function (args) {
                         args.success(args.data.response);
                     }, this._dataSource.read(r));
            }
        });
        return BaseWidgetWithDatasource;
    }
);

