define(['async', 'ap/modules/view/widget/basewidget', 'lib/modules/jquery.css3menu'],
    function (async, baseWidget) {
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
            _checkMenuItem: function (item, next) {
                var me = this;
                if (!item.accessCode) {
                    if (item.items) {
                        return me._checkMenuItems(item.items)
                            .then(function (filtered) {
                                item.items = filtered;
                                next({ result: true, item: item });
                            });
                    } else
                        return next({ result: true, item: item });
                }
                me.AP.Controller.AccessRightsHandler.canExecute(item.accessCode, function (res) {
                    var finalResult = { result: res.result, item: item };
                    item.locked = !res.result;
                    item.lockedCls = item.locked ? me._config.lockedCls : '';
                    if (finalResult.result && item.items) {
                        me._checkMenuItems(item.items)
                            .then(function (filtered) {
                                item.items = filtered;
                                next({ result: res.result, item: item });
                            });
                    } else next(finalResult);
                });
            },
            _checkMenuItems: function (items) {
                var me = this,
                    deferred = $.Deferred();

                async.eachSeries(items, function (item, next) {
                    me._checkMenuItem(item, function (res) {
                        next();
                    });
                },
                function (result) {
                    deferred.resolve(items);
                });

                return deferred.promise();
            },
            _generateMenu: function () {
                var me = this,
                    deferred = $.Deferred();
                me._checkMenuItems(me._config.items)
                    .then(function (result) {
                        me._config.items = result;
                        deferred.resolve(me.AP.View.Templates.renderTemplate('widget/menus/css3menu', { menuData: me._config }));
                    });

                return deferred.promise();
            },
            _setupMenu: function () {
                var me = this;
                me._generateMenu().then(function (html) {
                    me.$Block.append(html);
                    me._menu = me.$Block.css3menu(me._config).data('css3menu');
                    me._isExpanded ? me.expand() : me.collapse();
                    //this._setExtras();
                });

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
            }
        });
        return { name: 'CSS3Menu', widget: wid };
    });