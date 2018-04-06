
define(
[
     'ap/modules/view/widget/basewidgetwithdatasource'
],

function (baseWidgetWithDataSource) {


    'use strict';

    var panelBarwidget = baseWidgetWithDataSource.extend({
        _dataSrcConfig: {}, $BlockSlot: null, KendoWidget: null, _data: null, rawData: null, _hasloaded: false, _futureSelect: '',
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

            this.routeEvent('click', eventArgs);
        },
        _getDefaultConfig: function () {
            var me = this,
                  select = function (e) {
                      if (me._config.collapseOnSelect)
                          this.collapse($(this.element).find('.k-state-active'));
                      me._raiseClickEvent(e);
                  },
                  activate = function (e) {
                      var Item = e.item,
                              $Item = $(Item),
                              dataId = $Item.attr('data-id');
                      var eventArgs = {
                          BlockId: dataId,
                          e: e,
                          CanRepeat: true, selectedItem: me.getSelectedItem()
                      };
                      if (me.QueryId) {
                          eventArgs.BlockId = me.BlockId;
                      }

                      me.routeEvent('activate', eventArgs);
                  };
            return {
                loadingTemplate: '<div class="k-loading-image"></div>',
                select: select, activate: activate,
                autoRead: true,
                autoSelectFirst: true
            };
        },
        onInit: function (AP, BlockId) {
            var Block = AP.Model.getBlock(BlockId), me = this,
            WidgetConfig = this._config;
            this.$BlockSlot = this.$Block.find('>.Blocks');
            if (this.QueryId) {
                if (_.isObject(WidgetConfig.loadingTemplate)) {
                    WidgetConfig.loadingTemplate = AP.View.Templates.renderTemplate(WidgetConfig.loadingTemplate, Block);
                }
                this.$BlockSlot.remove();
                this.$Block.append('<ul class="Blocks"></ul>');
                this.$BlockSlot = this.$Block.find('>.Blocks');
                this._config.autoRead && this.buildDatasource();
            }
            else this.setup();
            this._registerHandlers();
        },
        _registerHandlers: function () {
            this.$BlockSlot.on('click', '.MenuIcon', $.proxy(function (e) {
                e.preventDefault();
                var AP = this.AP, Item = e.currentTarget, me = this,
                  $Item = $(Item).closest('[role="menuitem"]'),
                  dataId = $Item.attr('data-id');
                var eventArgs = {
                    BlockId: dataId,
                    e: e,
                    CanRepeat: true
                };
                if (me.QueryId) {
                    eventArgs.BlockId = me.BlockId;
                    eventArgs.currentItem = _.find(me._data, function (i) { return i[me._config.idField] == dataId });
                }

                this.routeEvent('iconClick', eventArgs);
                return false;
            }, this));
        },
        getSelectedItem: function () {
            var me = this, selected = this.KendoWidget.select();

            return selected ? _.find(me._data, function (i) { return i[me._config.idField] == $(selected[0]).data('id'); }) : null;
        },
        refresh: function () {
            if (this._dataSource) this._dataSource.read();
        },
        refreshAndSelect: function (id) {
            this._futureSelect = id;
            this.refresh();
        },
        deSelectMenuItem: function (sel, expand, silent) {
            if (!sel) {
                var data = this.getSelectedItem();
                if (!data) return;
                sel = kendo.format('[data-id="{0}"]', data[this._config.idField]);
            }
            var $selected = this.$BlockSlot.find(sel).parents('li[aria-expanded]');
            this.KendoWidget.select($selected);
            if (expand)
                this.KendoWidget.expand($seleted);

            if (!silent) {
                try {
                    this._raiseClickEvent({ item: $selected[0] });
                } catch (e) { }
            }
        },
        selectMenuItem: function (sel, expand, silent) {
            this.KendoWidget.select(sel);
            if (expand) {
                var $sel = this.$BlockSlot.find(sel), $seleted = $sel;
                if (!$sel.is('[aria-expanded]')) $seleted = $sel.parents('li[role="menuitem"][aria-expanded=false]');
                this.KendoWidget.expand($seleted);
            }
            if (!silent) {
                try {
                    var elt = this.$BlockSlot.find(sel)[0];
                    this._raiseClickEvent({ item: elt });
                    //elt.scrollIntoView();
                    $(elt).focus();
                } catch (e) { }
            }
        },
        refreshMenuItem: function (id, skipRender, expand) {
            if (!this._data) return;
            if (!skipRender) this.render(this._data);
            var selector = '[data-id="' + id + '"]';
            expand = expand || false;
            this.selectMenuItem(selector, expand);
        },
        setup: function () {
            if (this.KendoWidget) this.KendoWidget.destroy();
            this.$BlockSlot.kendoPanelBar(this._config);
            this.KendoWidget = this.$BlockSlot.data('kendoPanelBar');
        },
        requeststart: function () {
            this.$BlockSlot.html(this._config.loadingTemplate);
        },
        render: function (data) {
            this.$BlockSlot.html(this.AP.View.Templates.renderTemplate('widget/panelbar/panelbar', {
                results: this._data = data, config: this._config
            }));
            this.setup();
            if (!this._hasloaded) {
                this._hasloaded = true;
                if (this._config.expandFirst && this._data && this._data.length > 0) {
                    var f = this.KendoWidget._first();
                    this.KendoWidget.select(f);
                    this.KendoWidget.expand(f);
                }
            }
        },
        onDataChange: function (e) {
            this.render(e.sender.data());
            if (this._futureSelect) {
                var me = this;
                this.AP.Utils.invokeAsync(function () {
                    me.refreshMenuItem(me._futureSelect, true, true);
                    me._futureSelect = '';
                });
            } else if (this._config.autoSelectFirst) {
                this.KendoWidget.select(this.$BlockSlot.find('.k-panel > .k-item').first());
            }

            this.resizeScroll('.k-panelbar');
        },
        requestend: function (e) {
            this.rawData = e.response;
        }
    });
    return { name: 'PanelBar', widget: panelBarwidget };
});
