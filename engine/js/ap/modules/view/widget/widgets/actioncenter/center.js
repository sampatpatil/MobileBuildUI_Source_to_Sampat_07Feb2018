define(['ap/modules/view/widget/basewidget', './notificationList', 'react', './components/buldActionRenderer'],
    function (baseWidget, listbox, React, components) {
        var renderers = listbox.renderers, status = { notstartetd: -1, stopped: 0, running: 1, completed: 2 };
        var typeMethodMapping = {
            notification: 'addNotification',
            bulkAction: 'addBulkAction',
            action: 'addAction',
            error: 'addError'
        },
        actionManager = function (AP, msg) {
            this.title = msg.title;
            this.message = msg.message;
            this.action = msg.action;
            this.data = msg.data;
            this.status = status.stopped;
            this.message = function () {
                return AP.View.Internationalize.translate(msg.message);
            };
            this.type = 'action';
            this.statusStr = function () {
                var res = 'stopped';
                //TODO: 
                return res;
            };
            this._onComplete = function () {
                this.succeeded.push(this.current);
                this.next();
            };
            this._onFailed = function () {
                this.failed.push(this.current);
                this.next();
            };

            this.start = function () {
                if (!this.status == status.completed) {
                    msg.completed && msg.completed.call(this);
                    this.set('status', status.completed);
                    return;
                }
                AP.Controller.route(this.action, {
                    data: this.data,
                    success: $.proxy(this._onComplete, this),
                    error: $.proxy(this._onFailed, this)
                });
            };

        },
        actionManagers = {
            action: function (AP, actionData) {
                return kendo.observable(new actionManager(AP, actionData));
            },
            bulkAction: function (AP, actionData) {
                actionData.id = actionData.id || kendo.guid();
                actionData.type = 'bulkAction';
                actionData.status = actionData.status == null ? status.notstartetd : actionData.status;                
                return actionData;
            }
        };

        var wid = baseWidget.extend({
            _fx: null, _isOpen: false,
            _data: null, $notifications: null,
            _running: 0, _panel: null,
            $actionCenterOverlay: null,
            _getDefaultConfig: function () {
                var AP = this.AP;
                return {
                    maxParallelTasks: 3,
                    saveActions: true,
                    saveActionsKey: 'ActionCenterData',
                    dataSource: new kendo.data.ObservableArray([]),
                    itemTemplates: {
                        notification: AP.View.Templates.getTemplate('widget/actioncenter/notification'),
                        bulkAction: AP.View.Templates.getTemplate('widget/actioncenter/bulkAction'),
                        action: AP.View.Templates.getTemplate('widget/actioncenter/action'),
                        error: AP.View.Templates.getTemplate('widget/actioncenter/error')
                    }
                };
            },
            save: function () {
                if (!this._panel || !this._panel.isMounted()) return;
                var ds = this._panel && this._panel.getData();
                if (!ds) return;
                var data = { isOpen: this._isOpen, data: ds };
                localStorage.setItem(this._config.saveActionsKey, kendo.stringify(data));
            },
            onViewModelBinding: function () {

            },
            onViewModelBind: function () {

            },
            refresh: function () {
                this.render();
            },
            read: function () {
                try {
                    var me = this, data = $.parseJSON(localStorage.getItem(this._config.saveActionsKey));
                    if (!data) return;
                    /*if (data.isOpen)
                        me.show();*/
                    (data.data || []).forEach(function (item) {
                        item.type && me[typeMethodMapping[item.type]](item);
                    });
                } catch (e) { }
            },
            onInit: function (AP, BlockId) {
                AP.ActionCenter = this;
                var model = AP.Model.getBlock(BlockId);
                this._fx = kendo.fx(this.$Block);
                this.$Block.append(AP.View.Templates.renderTemplate('widget/actioncenter/panel',
                                                       { AP: AP, BlockId: BlockId, Block: model }));
                this.$notifications = this.$Block.find('.items-container');
                this._data = [];
                this._setupExtras();
                this.read();
                this.render();
            },
            render: function (force) {
                var notificationPanel = components.getComponent(this.AP).notificationPanel, props = { items: this._data };
                force && (this._panel = null);
                if (this._panel) {
                    this._panel.setProps(props);
                    return;
                }
                this._panel = React.renderComponent(notificationPanel(props), this.$notifications[0]);
            },
            _setupExtras: function () {
                var AP = this.AP;
                this.$actionCenterOverlay = AP.View.$ViewRoot.find('.ActionCenter-Overlay');
                if (this.$actionCenterOverlay.length == 0) {
                    this.$actionCenterOverlay = $('<div class="ActionCenter-Overlay" style="position: fixed;width: 100%;height: 100%;z-index: 999998;display:none;"></div>');
                    this.$actionCenterOverlay.prependTo(this.$Block.parent());
                    this.$actionCenterOverlay = this.$Block.parent().find('.ActionCenter-Overlay');
                }
                AP.View.$ViewRoot.append().on('click', '.ActionCenter-Overlay', function (e) {
                    AP.ActionCenter.hide();
                });
                AP.View.$ViewRoot.on('click', '.ActionCenter-Toggler', $.proxy(function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    this.toggle();
                }, this));
            },
            toggle: function () {
                this[this._isOpen ? 'hide' : 'show']();
                this.save();
            },
            addNotification: function (msg) {
                if (!msg) return msg;
                msg = $.extend(msg, { type: 'notification' });
                this._data.push(msg);
                this.render();
                this.save();
            },
            addError: function (msg) {
                if (!msg) return msg;
                msg = $.extend(msg, { type: 'error' });
                this._data.push(msg);
                this.render();
                this.save();
            },
            addAction: function (msg) {
                if (!msg) return msg;
                msg = actionManagers.action(this.AP, msg);
                this._data.push(msg);
                this.render();
                this.save();
            },
            addBulkAction: function (msg) {
                if (!msg) return msg;
                msg = actionManagers.bulkAction(this.AP, msg);
                this._data.push(msg);
                this.render();
                this.save();
                this.show();
            },
            notifyPartialComplete: function () {
                this.save();
            },
            notifyStart: function () {
                this.save();
            },
            notifyComplete: function (msg) {
                msg && msg.completed && msg.completed();
                this.save();
            },
            show: function () {
                this.$actionCenterOverlay.show();
                var me = this;
                if (me._isOpen) return;
                $.pageslide.close();
                me._fx.slideInLeft().play();
                me._isOpen = true;
            },
            hide: function () {
                this.$actionCenterOverlay.hide();
                var me = this;
                if (!me._isOpen) return;
                me._fx.slideInLeft().reverse();
                me._isOpen = false;
            },
            destroy: function () {
                this.AP.View.$ViewRoot.off('click', '.ActionCenter-Toggler');
                this.save();
            }

        });
        return { name: 'ActionCenter', widget: wid };
    });