
define(['ap/modules/view/widget/basewidget', 'lib/modules/utilities'],
    function (baseWidget, utils) {

        'use strict';

        var windowWidget = baseWidget.extend({
            KendoWidget: null,
            _isOpen: false,
            _getDefaultConfig: function () {
                return {
                    width: 'auto',
                    height: 'auto',
                    maximize: false,
                    resizable: true,
                    appendTo: this.AP.Config.Data.WindowRenderTarget,
                    modal: false,
                    visible: false,
                    activate: $.proxy(function () {
                        //refresh custom scrolls once the window is loaded to ensure all native scrolls are replaced.
                        utils.invokeAsync(function () { this.AP.View.refreshScrollables(); }, this, null, 500);
                        this.KendoWidget.center();

                        if (this._config.maximize)
                            this.KendoWidget.maximize();

                        this.$Block.find('.APWidget').each(function () {
                            var $elt = $(this);
                            var widget = $elt.data('APWidget');
                            widget && widget.onKendoWindowActivated && widget.onKendoWindowActivated.apply(widget, arguments);
                        });

                    }, this),
                    open: $.proxy(function () {
                        this._isOpen = true;
                        this.KendoWidget.center();
                    }, this),
                    deactivate: $.proxy(function () {
                        this._isOpen = false;
                        this.destroy();
                    }, this),
                    close: $.proxy(function () { this._isOpen = false; }, this)
                };
            },
            onInit: function (AP, BlockId) {

                var Me = this,
                    Block = AP.Model.getBlock(BlockId), Config = this._config;

                this.QueryId = Block.get('Widget.QueryId');
                this.BlockId = BlockId;
                this.KeyTitle = Block.get('KeyTitle');
                this._config = Config;
                this._initialized = false;
                if (Config.uniqueId) {
                    this._uniqueId = Config.uniqueId;
                    AP.View.Windows.register(Config.uniqueId, this);
                }
                else {
                    this._create();
                    this._init();
                }

            },

            _create: function (open) {
                var me = this;
                me.$Block.kendoWindow(me._config);
                me.KendoWidget = me.$Block.data("kendoWindow");
                me._init();
                me._initialized = true;
                if (open) me.KendoWidget.open();
                return true;
            },
            _registerEvent: function (eventName) {
                this.KendoWidget.bind(eventName, $.proxy(function () {
                    this.routeEvent(eventName, { BlockId: this.BlockId });
                }, this));
            },
            _init: function () {
                var Config = this._config;
                this.NoCenter = false;
                this.MessageType = Config.MessageType;
                this.KendoWidget.bind('resize', $.proxy(function () {
                    this.$Block.find('.APWidget').each(function () {
                        var $elt = $(this);
                        var widget = $elt.data('APWidget');
                        widget && widget.onKendoWindowResize && widget.onKendoWindowResize.apply(widget, arguments);
                    });
                }, this));
                this._registerEvent('open');
                this._registerEvent('close');

                this.AP.Controller.Events.Window.onResize.add(this.center, this);
                this.center();


                this.translateTexts();

                this.configureHeadButtons();

                switch (this.MessageType) {

                    case 'Alert':

                        this.setContent({
                            Content: this.AP.Model.ViewModel.get('State.Query.Alert')
                        });
                        break;
                };

                if (Config.AutoOpen) { this.KendoWidget.open(); }
            },

            configureHeadButtons: function () {

                var Me = this,
                    $Buttons = this.KendoWidget.wrapper.find('.k-window-actions .k-icon');

                $Buttons.on('click', '.k-i-restore', function () {

                    Me.AP.Controller.route('action/Window/tileHorizontal', { CanRepeat: true });
                });
            },
            onViewModelBind: function () {
                /*Fix for kendo window's title is emptied right after the binding is applied.*/
                this.translateTexts();
            },
            translateTexts: function () {
                var title = '';
                if (this.KeyTitle) {
                    title = this.AP.View.Internationalize.translate(this.KeyTitle);

                } else if (this.QueryId) {
                    var vm = this.AP.Config.loadQuery(this.QueryId);
                    if (vm.Title)
                        title = vm.Title;
                    else if (this._config.titlePath)
                        title = vm.get(this._config.titlePath);

                }
                title && this.KendoWidget && utils.invokeAsync($.proxy(function (t) { this.KendoWidget.title(t); }, this), this, [title]);
            },

            setContent: function (Args) {

                if (Args.Title) { this.KendoWidget.title(Args.Title); }
                if (Args.Content) { this.KendoWidget.content(Args.Content); }
            },

            open: function () {
                if (!this._initialized) this._create();
                this.KendoWidget.open();
            },

            center: function () {

                if (this.KendoWidget.options.visible && !this.NoCenter) { this.KendoWidget.center() };
            },

            clear: function () {

                this.KendoWidget.close();
            },

            destroy: function () {
                if (this._uniqueId) this.AP.View.Windows.unRegister(this._uniqueId);
                baseWidget.fn.destroy.call(this);

            }
        });


        return { name: 'Window', widget: windowWidget };
    }
)
