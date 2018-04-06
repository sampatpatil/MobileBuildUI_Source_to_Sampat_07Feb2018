
define(
[
     'ap/modules/view/widget/basewidgetwithdatasource'
],

function (baseWidgetWithDataSource) {
    'use strict';
    var treeViewwidget = baseWidgetWithDataSource.extend({
        _dataSrcConfig: {}, KendoWidget: null, _data: null, rawData: null,
        _selectedItem: null, 
        _raiseClickEvent: function (e) {
            var Item = e.item, me = this,
                     $Item = $(Item),
                     dataId = $Item.attr('data-id');
            var eventArgs = {
                BlockId: dataId,
                e: e,
                CanRepeat: true
            };
            if (me.QueryId) {
                eventArgs.BlockId = me.BlockId;
                eventArgs.lastSelectedItem = me._selectedItem;
                eventArgs.selectedItem = me._selectedItem = _.find(me._data, function (i) { return i[me._config.idField] == dataId });
            }

            this.AP.Controller.route('event/click', eventArgs);
        },
        _onDrag: function (e) {
            var $target = $(e.dropTarget), data = this.KendoWidget.dataItem(e.sourceNode);
            $target.is(this._config.dropTargetSel) && e.setStatusClass('k-add');
        },

        /*Registering Change Event*/
        _onChange: function (e) {
            var $item = this.KendoWidget.select();
            this.routeEvent('change', {
                selectedItem: $item
            });
        },
        _onDrop: function (e) {
            e.preventDefault();
            var $target = $(e.dropTarget), sourceData = this.KendoWidget.dataItem(e.sourceNode),
                destData = this.KendoWidget.dataItem(e.destinationNode);
            var args = { handled: false, sourceData: sourceData, destData: destData, event: e };
            this.routeEvent('drop', args);
            if (!args.handled) {
                $target.is(this._config.dropTargetSel) && $target.val($target.val() + (sourceData && sourceData[this._config.valueField] || ''));
            }
        },
        _onExpand: function (e) {
           

        },

        _getDefaultConfig: function () {
            return {
                valueField: 'value', dropTargetSel: ':text',
                editable: false,
                dataBound: $.proxy(this._dataBound, this),
                drag: $.proxy(this._onDrag, this),
                drop: $.proxy(this._onDrop, this),
                change: $.proxy(this._onChange, this),
                expand: $.proxy(this._onExpand, this)
            };
        },
        onInit: function (AgilePoint, BlockId) {

            this.setup();
            this.QueryId && this.buildDatasource(null, false);


        },
        _createNewDataSource: function (config) {
            var ds = baseWidgetWithDataSource.fn._createNewDataSource.apply(this, arguments);
            this.KendoWidget.setDataSource(ds);
            return ds;
        },
        refresh: function () {
            
            this.KendoWidget && this.routeEvent('refresh', {
                BlockId: this.BlockId,
                CanRepeat: true
            });
            if (this._dataSource) this._dataSource.read();
        },
        _dataBound: function (e) {
            var me = this, treeview = e.sender;
            treeview.element.find('.editable').kendoinplaceeditor({
                change: function (e) {
                    var value = e.sender.value(), model = treeview.dataItem(e.sender.element.parents('[data-uid]'));
                }
            });
            me.KendoWidget && this.routeEvent('databound', {
                BlockId: this.BlockId,
                e: e,
                nodeItems: e.sender.items(),
                CanRepeat: true
            });
        },
        setup: function () {
            if (this.KendoWidget) this.KendoWidget.destroy();
            this.$Block.kendoTreeView(this._config);
            this.KendoWidget = this.$Block.data('kendoTreeView');
        },
        requeststart: function () {
            this.showProgress();
        },
        addItem: function (data) {
            if (!data) return;
            this.KendoWidget && this.KendoWidget.dataSource && this.KendoWidget.dataSource.add(data);
        },
        removeItem: function (data) {
            if (!data) return;
            this.KendoWidget && this.KendoWidget.dataSource && this.KendoWidget.dataSource.remove(data);
        },
        getSelectedItem: function () {
            return this.KendoWidget && this.KendoWidget.dataItem(this.KendoWidget.select());
        },
        requestend: function (e) {
            this.hideProgress();
        }
    });
    return { name: 'TreeView', widget: treeViewwidget };
});
