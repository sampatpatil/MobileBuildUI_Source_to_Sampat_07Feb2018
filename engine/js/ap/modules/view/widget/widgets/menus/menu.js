define(['ap/modules/view/widget/basewidget'],
    function (baseWidget) {
        var wid = baseWidget.extend({
            _menu: null,
            _getDefaultConfig: function () {
                return { hoverDelay: 750 };
            },
            _constructConfig: function (defaults, config) {
                return $.extend(true, {}, defaults, config, { select: $.proxy(this._onMenuSelect, this) });
            },
            onInit: function (AP, BlockId) {
                var model = AP.Model.getBlock(BlockId), defaults = {};
                this._setupMenu();
            },
            _onMenuSelect: function (e) {
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
                    eventArgs.selectedItem = _.find(me._data, function (i) { return i[me._config.idField] == dataId });
                }

                this.routeEvent('click', eventArgs);
            },
            _setupMenu: function () {
                this._menu = this.$Block.find('>.Blocks').kendoMenuEx(this._config).data('kendoMenuEx');
                //this._setExtras();
                this._isExpanded ? this.expand() : this.collapse();
            },
            _isExpanded: false,
            expand: function () {
                this._isExpanded = true;
                if (!this._menu) return;
                this._menu.expand();
            },
            collapse: function () {
                this._isExpanded = false;
                if (!this._menu) return;
                this._menu.collapse();
            },
            _setExtras: function () {
                if (!this._config.menuIconSel) return;
                var genericHandler = function (e, handlers) {
                    handlers[e.type](e);
                }, primaryHandlers = {
                    mouseenter: $.proxy(function (e) {
                        var $target = $(e.target).siblings();
                        $target.length && kendo.fx($target).expandHorizontal().stop().play();
                    }, this),
                    mouseleave: $.proxy(function (e) {
                        var $target = $(e.target).siblings();
                        $target.length && kendo.fx($target).expandHorizontal().stop().reverse();
                    }, this)
                }, secondaryEventHandlers = {
                    mouseenter: $.proxy(function (e) {
                        this._menu && this._menu.open($(e.target).parents(['role="menuitem"']));
                    }, this),
                    mouseleave: $.proxy(function (e) {
                        this._menu && this._menu.close($(e.currentTarget));
                    }, this)
                };
                //this.$Block.on('mouseenter mouseleave', this._config.menuIconSel, function (e) { genericHandler(e, primaryHandlers) });
                this.$Block.on('mouseleave', '.k-item.List', function (e) { genericHandler(e, secondaryEventHandlers) });
                this.$Block.on('mouseenter', '.List > .k-link .Field.Title', function (e) { genericHandler(e, secondaryEventHandlers) });
            }
        });
        return { name: 'Menu', widget: wid };
    });