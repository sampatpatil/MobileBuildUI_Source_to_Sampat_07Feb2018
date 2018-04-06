define(

    [
        'lib/modules/signals',
        'lib/modules/utilities',
        'kendo',
        'lib/modules/nicescroll'
    ],

    function (Signal, utilities) {

        'use strict';
        var registerHandlers = function () {
            var AP = this.AP,
                model = AP.Model.getBlock(this.BlockId);
            if (model) {
                var $parent = this.getParentBlock(),
                    parent = this.getParentWidget();
                this._handlers = AP.Model.EventTree.create(model.Name || model.Class, this);
                var defrd = $parent.data('widgetResolver') || $.Deferred();
                $parent.data('widgetResolver', defrd);

                if (parent == null) {
                    defrd.done($.proxy(function (parnt) {
                        (this._handlers != parnt) && parnt && this._handlers && parnt.addChild(this._handlers);
                    }, this));
                } else parent._handlers && this._handlers && parent._handlers.addChild(this._handlers);
            }

            var resolver = this.$Block.data('widgetResolver');
            resolver && resolver.resolve(this._handlers);
            this.$Block.data('widgetResolver', null);
        };
        var BaseWidget = kendo.Class.extend({
            $Block: null,
            AP: null,
            _config: null,
            BlockId: '',
            _events: new Object,
            _handlers: null,
            _getDefaultConfig: function () {

            },
            getConfig: function () {
                return this._config;
            },
            _constructConfig: function (defaults, widgetConfig) {
                return $.extend(true, {}, defaults, widgetConfig);
            },
            getParentBlock: function () {
                return this.$Block.parents('[data-widget=true]').first();
            },
            getParentWidget: function () {
                return this.getParentBlock().data('APWidget');
            },
            isHostedByWindow: function () {
                return this.getHostingWindow() != null;
            },
            getHostingWindow: function () {
                return this.$Block.parents('.APWindow').data('APWidget');
            },
            /*registerChildren: function () {
                var me = this;
                this.$Block.find('.Blocks > .Block.APWidget').each(function () {
                    var $widget = $(this), widget = $widget.data('APWidget');
                    widget && widget._handlers && me._handlers.addChild(widget._handlers);
                });
            },*/
            init: function (AgilePoint, BlockId) {
                var AP = this.AP = AgilePoint;
                this.$Block = AP.View.getBlock(BlockId);
                this.BlockId = BlockId;
                this.AP.Controller.Events.Model.onChangeCulture.add(this.translateTexts, this);
                var defaults = this._getDefaultConfig(),
                    model = AP.Model.getBlock(BlockId);
                registerHandlers.call(this);
                if (defaults) {
                    var config = (model && model.get('Widget.Config')) || {};
                    config.toJSON && (config = config.toJSON());
                    this._config = this._constructConfig(defaults, config);
                }
                this.preOnInit.apply(this, arguments);
                this.onInit.apply(this, arguments);
                this.postOnInit.apply(this, arguments);
                AP.Controller.route('bind', { target: this.$Block });
            },
            addEvent: function () {
                var me = this;
                _.each(arguments || [], function (e) {
                    me._events[e] = new Signal();
                });
            },
            removeEvent: function (eventName) {
                var me = this;
                _.each(arguments, function (e) {
                    me._events[e] = null;
                    delete me._events[e];
                });
            },
            bind: function (event, callback) {
                this._events[event].add(callback);
            },
            unbind: function (event, callback) {
                this._events[event].remove(callback);
            },
            trigger: function (eventName, args) {
                this._events[eventName].dispatch.apply(this._events[eventName], args || []);
            },
            onViewModelBind: function () {

            },
            preOnInit: function () {

            },
            postOnInit: function () {

            },
            onInit: function () {

            },
            enableAllButtons: function (enable) {
                var me = this;
                this.$Block.find('a[data-action]')
                    .each(function () {
                        me.button($(this).attr('data-action'), enable);
                    });
            },
            activateButtons: function (ActionsList) {

                if (ActionsList) {
                    for (var ActionIndex in ActionsList) {
                        this.button(ActionsList[ActionIndex], true);
                    }
                } else {
                    this.enableAllButtons(true);
                }
            },
            disableButtons: function (ActionsList) {

                if (ActionsList) {
                    for (var ActionIndex in ActionsList) {
                        this.button(ActionsList[ActionIndex], false);
                    }
                } else {
                    this.enableAllButtons(false);
                }
            },
            button: function (Action, Active) {

                var $Button = this.$Block.find('.k-button[data-action="' + Action + '"]');
                if (Active) {
                    $Button
                        .removeClass('k-state-disabled')
                        .removeAttr('disabled');
                } else {
                    $Button
                        .addClass('k-state-disabled')
                        .attr('disabled', 'true');
                }
            },

            showAllButtons: function (enable) {
                var me = this;
                this.$Block.find('a[data-action]')
                    .each(function () {
                        me.buttonVisiblity($(this).attr('data-action'), true);
                    });
            },

            showButtons: function (ActionsList) {

                if (ActionsList) {
                    for (var ActionIndex in ActionsList) {
                        this.buttonVisiblity(ActionsList[ActionIndex], true);
                    }
                }
            },

            hideButtons: function (ActionsList) {
                if (ActionsList) {
                    for (var ActionIndex in ActionsList) {
                        this.buttonVisiblity(ActionsList[ActionIndex], false);
                    }
                }
            },

            buttonVisiblity: function (Action, Visible) {

                var $Button = this.$Block.find('.k-button[data-action="' + Action + '"]');
                if (Visible) {
                    $Button.show();

                } else {
                    $Button
                        .hide();
                }
            },

            showProgress: function () {
                this.$Block && kendo.ui.progress(this.$Block, true);
            },
            hideProgress: function () {
                this.$Block && kendo.ui.progress(this.$Block, false);
            },
            translateTexts: function () {
                var AP = this.AP;
                this.$Block
                    .find('*[data-text-key]')
                    .each(function () {

                        var $this = $(this);
                        var KeyText = $this.attr('data-text-key');
                        var Text = AP.View.Internationalize.translate(KeyText);

                        if ($this.is("input")) {
                            !$this.attr('title') && $this.attr('title', Text);
                            !$this.attr('placeholder') && $this.attr('placeholder', Text);
                        }


                        if ($this.is('[type="submit"]')) {
                            $this.val(Text);
                        } else if ($this.is('button')) {
                            var $btnText = $this.find('span.res-text');
                            if ($btnText.length == 0)
                                $btnText = $this.append('<span class="res-text"/>').find('span.res-text');
                            $btnText.html(Text);
                        } else if (!$this.is(':checkbox,:radio'))
                            $this.html(Text);

                    });
            },
            error: function (e) {

            },
            destroy: function () {
                this.routeEvent('destroy');
                this._handlers = null;
                this.$Block
                    .find('.APWidget')
                    .each(function () {

                        var Widget = $(this).data('APWidget');
                        if (Widget) {
                            Widget.destroy();
                        }
                    });
                if (this.KendoWidget)
                    this.KendoWidget.destroy();
                this.$Block.find('[data-role]').each(function () {
                    _.each($(this).data(), function (v) {
                        v && v.destroy && v.destroy();
                    });
                });
                this.$Block.data('APWidget', null);
            },
            show: function () {
                this.AP.Controller.route('event/show', {
                    AP: this.AP,
                    BlockId: this.BlockId
                });
                this.$Block.show();
            },
            hide: function () {
                this.AP.Controller.route('event/hide', {
                    AP: this.AP,
                    BlockId: this.BlockId
                });
                this.$Block.hide();
            },
            _getMessageContainerHolder: function () {
                return this.$Block;
            },
            _overlayMsgContainer: null,
            showMessageKey: function (key) {
                this.showMessage(this.AP.View.Internationalize.translate(key));
            },
            showMessage: function (htmlRtext) {
                var $holder = this._getMessageContainerHolder();
                if (!$holder) return;
                if (!this._overlayMsgContainer)
                    this._overlayMsgContainer = $holder
                        .append('<div class="OverlayMessageContainer"><div class="MessageContent"></div></div>')
                        .find('>.OverlayMessageContainer');
                this._overlayMsgContainer.find('.MessageContent').html(htmlRtext);
                this._overlayMsgContainer.show();
            },
            hideMessage: function () {
                this._overlayMsgContainer && this._overlayMsgContainer.remove();
                this._overlayMsgContainer = null;
            },
            routeEvent: function (event, args) {
                var me = this;
                me._handlers && me._handlers.executeHandler(event, args)
                .done(function (result) {
                    (!result) &&
                        me.AP.Controller.route('event/' + event, $.extend(true, {}, {
                            BlockId: me.BlockId,
                            sender: me
                        }, args));
                });

            },
            ///The hook gets exceuted if the current widget is placed inside kendo window and the windows is resized
            onKendoWindowResize: function () {

            },
            onKendoWindowActivated: function () { },
            ///The hook gets exceuted when the native window is resized
            ///The best place to execute the code that updates layout on window resize
            onWindowResize: function () {

            },
            _getDefaultScrollContainer: function () {
                return this.$Block;
            },
            _getScrollContainer: function (sel) {
                return (sel ? this.$Block.find(sel) : this._getDefaultScrollContainer());
            },
            _getScrollConfig: function (sel) {
                return {};
            },
            initScroll: function (sel) {
                var $container = this._getScrollContainer(sel);
                return $container.niceScroll(null, this._getScrollConfig(sel));
            },
            _manScroll: function (sel, method) {
                try {
                    var scroll = this.getScroll(sel);
                    scroll && scroll[method]();
                } catch (e) {
                    this.error(e);
                }
            },
            getScroll: function (sel) {
                var scroll = this._getScrollContainer(sel).getNiceScroll();
                return (scroll && scroll.length ? scroll : this.initScroll(sel));
            },
            hideScroll: function (sel) {
                this._manScroll(sel, 'hide');
            },
            showScroll: function (sel) {
                this._manScroll(sel, 'show');
            },
            resizeScroll: function (sel) {
                utilities.invokeAsync(this._manScroll, this, [sel, 'resize']);
            },
            /// The callback that is fired by visibleEx binding
            onVisibilityChanged: function (visible) {

            },
            // called whenever page is interacted
            onPageInteracted: function () {

            }
        });
        return BaseWidget;
    }
);