
define(

    [

        'ap/modules/view/internationalize',
        'ap/modules/view/templates',
        'ap/modules/view/widget/widget',
        'async',
        'lib/modules/utilities'
    ],

    function (
        Internationalize,
        Templates,
        Widget,
        async,
        utilities
    ) {

        'use strict';
        var objectStore = function () {
            var _store = new Object();
            this.register = function (id, module) {
                _store[id] = module;
            };
            this.unRegister = function (id, module) {
                _store[id] = null;
                delete _store[id];
            };
            this.get = function (id) {
                return _store[id];
            }
        };
        var AP, Me;

        var scrollHelper = function ($container) {
            var _manScroll = function (sel, method) {
                try {
                    var scroll = getScroll(sel);
                    scroll && scroll[method]();
                } catch (e) {

                }
            },
             initScroll = function (sel) {
                 var $element = $container.find(sel);
                 return $element.niceScroll($element.hasClass('enable-horizontal-scroll') ? {} : { horizrailenabled: false });
             },
             getScroll = function (sel) {
                 var $elts = adjustHeight(sel);
                 var scroll = $elts.getNiceScroll();
                 return (scroll && scroll.length == $elts.length ? scroll : initScroll(sel));
             }, adjustHeight = function (sel) {
                 /*$container.find('.custom-height').each(function () {
                     var $elt = $(this);
                     var $parent = $elt.parent();
                     var oh = $parent.outerHeight();
                     var ofh = 0;
                     $parent.siblings().not($elt).each(function () { ofh += $(this).outerHeight(); });
                     $elt.css('max-height', (oh - ofh) + 'px !important');
                 });*/
                 return $container.find(sel);
             };

            //Accepts jQuery element and finds its nicescroll intance or creates new to refresh
            this.refreshScroll = function ($elt) {
                var scroll = $elt.getNiceScroll();
                scroll = (scroll && scroll.length ? scroll : $elt.niceScroll($elt.hasClass('enable-horizontal-scroll') ? {} : { horizrailenabled: false }));
                scroll && scroll.resize();
            };

            this.makeScroll = function (sel) {
                var scroll = getScroll(sel);
                scroll && scroll.resize();
            };

        },
        forEachWidgetIn = function ($view, callback) {
            $view.find('.APWidget').each(function () {
                var widget = $(this).data('APWidget');
                callback && widget && callback(widget);
            });
        };

        /*Created by Srinath to improve performance by reducing DOM queries*/
        var viewRegistry = function ($container) {
            var cache = new Object(),
                get = function (id) {
                    if (id && $container.attr('id') == id) return $container;
                    var $elt;
                    return id ? ($elt = $container.find('#' + id)).length ? $elt : $container.find('[data-id="' + id + '"]') : $([]);
                };

            /*$container.on('DOMNodeRemoved', function (e) {
                var $elt = $(e.originalEvent.target);
                var id = $elt.data('id');

                $elt.is('.Block') && (delete cache[id]);
            });*/

            this.add = function (id, $elt) {
                return (cache[id] = $elt);
            };

            var refresh = function (id) {
                var $elt = cache[id];
                if (!$elt || !$.contains(document, $elt[0])) {
                    $elt = get(id);
                }
                return (cache[id] = $elt);
            };

            this.getCache = function () {
                return cache;
            };

            this.get = function (id) {
                //return get(id);
                return refresh(id);
            };

            this.forget = function (id) {
                cache.hasOwnProperty(id) && (delete cache[id]);
            };
        };

        var AgilePointView = function (AgilePoint) {

            AP = AgilePoint;
            Me = this;

            this.Internationalize = new Internationalize(AP);
            this.Templates = new Templates(AP);
            this.Widget = new Widget(AP);
        };

        AgilePointView.prototype.start = function () {
            // Window events
            var $Window = $(window), setViewPortWidth = function () {
                if ($Window.width() < 1280)
                    $('#metaViewPort').attr('content', 'width=1280');
                else $('#metaViewPort').attr('content', 'width=device-width');
            };
            var throttledMouseup = _.throttle($.proxy(function (e) {
                this.notifyInteraction.apply(this, arguments);
                //this._scroll.refreshScroll($(e.currentTarget));
                return false;
            }, this), 1000);
            $Window.on('resize', _.debounce($.proxy(function () {
                AP.Controller.Events.Window.onResize.dispatch($Window);
                setViewPortWidth();
                this.notifyResize();
                return false;
            }, this), 250)).on('mouseup', function (e) {
                e.preventDefault();
                //TODO: use DOM mutation events to identify whether dom content is changed and refresh the scroll accordingly.
                throttledMouseup.apply(this, arguments);
                return false;
            });
            setViewPortWidth();
            // DOM View container && RootNode
            var DOMViewContainerId = AP.Config.Data.DOMViewContainerId || 'body',
                $DOMViewContainerId = $(DOMViewContainerId),
                MainBlockId = AP.Model.MainBlockId,
                MainBlock = AP.Model.getBlock(MainBlockId),
                MainBlockHTML = this.Templates.renderTemplate('main', MainBlock);

            $DOMViewContainerId.append(MainBlockHTML);
            this.$ViewRoot = $DOMViewContainerId.find('#' + MainBlockId); // Reference to Top level APP DOM element for binding.
            /*A registry of created dom elements*/
            this.registry = new viewRegistry(this.$ViewRoot);

            this.$ViewRoot.remainingH();

            this.$ViewRoot.on('DOMNodeInserted', '[data-auto-bind="true"]', function (e) {
                var $elt = $(e.target);
                if ($elt.is('[data-auto-bind-target="true"]'))
                    AP.Controller.route('bind', { target: $elt });
            })/*Listen for popup's createScroll event to initalize the custom Scrol*/
                .on('createScroll', function (e, popup) {
                    var $lbox = popup.element.find('[role=listbox]')
                        .css({ overflow: 'hidden' });

                    var height = $lbox.parents('.k-animation-container').height();
                    if (height && height > 100) $lbox.height(height - 5);
                    $lbox.niceScroll({
                        overflowx: false,
                        horizrailenabled: false,
                        cursorcolor: AP.Config.Data.scrollColor
                    });
                });
            // Singleton waiting layer
            var WaitingHTML = this.Templates.renderTemplate('widget/waiting'),
                $Waiting = this.$ViewRoot.append(WaitingHTML).find('#APWaiting').eq(0),
                Waiting = Widget.Repository.getWidgetDef('APWaiting').widget;
            this.Waiting = new Waiting(AP, $Waiting);
            this._scroll = new scrollHelper(this.$ViewRoot);
            // Suscribe Events
            AP.Controller.Events.Model.onNewData.add(AP.Config.Data.asyncRender ? this.onModelNewDataAsyncHandler : this.onModelNewData, this);
            AP.Controller.Events.Model.onInterfaceStateChange.add(this.onInterfaceStateChanged, this);
            AP.Controller.Events.Model.onDataQueueComplete.add(this.onLoadDNAQComplete, this);
        };

        AgilePointView.prototype.registry = null;
        AgilePointView.prototype.getMainMenuWidth = function () {
            return this.$ViewRoot.find('.MainMenu').outerWidth();
        };
        AgilePointView.prototype._isMainMenuOpen = false;
        AgilePointView.prototype.isMainMenuOpen = function () {
            return this._isMainMenuOpen;
        };
        AgilePointView.prototype.onInterfaceStateChanged = function (old, current) {
            var mainmenuclosed = 'mainmenuclosed', wasInOld = old.indexOf(mainmenuclosed) > -1, newInCurrent = current.indexOf(mainmenuclosed) > -1;
            var opened = this._isMainMenuOpen = !newInCurrent;
            //Notify widgets of mainmenu closed
            forEachWidgetIn(this.$ViewRoot, function (widget) {
                widget.onMainMenuStateChanged && widget.onMainMenuStateChanged(opened);
            });
        };

        AgilePointView.prototype._scroll = null;
        AgilePointView.prototype._currentMaster = '';

        // ------------------------------------------------------------------------------------
        // Recursive render of View Blocks 

        AgilePointView.prototype.renderBlockAsync = function (TargetId, NewBlockId) {

            var me = this, deferred = $.Deferred(), $DOMTarget = me.getBlock(TargetId),
                $DOMTargetBlocks = $DOMTarget.find(' > .Blocks'),
                ParentBlock = AP.Model.getBlock(TargetId),
                NewBlock = AP.Model.getBlock(NewBlockId),
                BlockTemplateId = NewBlock.get('Template') || 'block', // Default Block template
                HTMLBlock = me.Templates.renderTemplate(BlockTemplateId, NewBlock),
                DOMBlocksExists = $DOMTargetBlocks.length > 0,
                $DOMBlockParent;

            if (DOMBlocksExists) {

                $DOMBlockParent = $DOMTargetBlocks.eq(0);
            } else {

                var BlocksTemplateId = NewBlock.get('BlocksTemplate') || 'blocks', // Default Blocks template
                    BlocksHTML = Me.Templates.renderTemplate(BlocksTemplateId, ParentBlock);

                $DOMBlockParent = $DOMTarget.append(BlocksHTML)
                                  .find('> .Blocks').eq(0);

                // publish DOM event
                $DOMTarget.trigger('blocksAdded');
            }

            //$DOMBlockParent.css({ opacity: 0 });

            $DOMBlockParent.append(HTMLBlock);

            var $Block = me.getBlock(NewBlockId);
            NewBlock.Widget && $Block.attr('data-widget', true);
            // Create nested blocks

            var ChildBlocks = NewBlock.get('Blocks'),
                afterChildrenRendered = function () {
                    /*If new block has a widget to render then mark it for creating widget after constructing DOM*/
                    if (NewBlock.Widget) {

                        $Block.data('parentid', TargetId);
                        renderWidgetIn.call(me, NewBlockId);
                    }
                    // publish DOM event
                    $DOMBlockParent.trigger('blockAdded');
                    //$DOMBlockParent.css({ opacity: 1 });
                    deferred.resolve();
                };

            if (ChildBlocks && ChildBlocks.length > 0) {

                async.eachSeries(ChildBlocks, function (childBlock, next) {
                    me.renderBlockAsync(NewBlockId, childBlock).done(function () {
                        async.nextTick(next);

                    });
                }, afterChildrenRendered);
            } else afterChildrenRendered();

            return deferred.promise();
        };

        // ------------------------------------------------------------------------------------
        // Recursive render of View Blocks 

        AgilePointView.prototype.renderBlock = function (TargetId, NewBlockId) {

            var me = this, $DOMTarget = me.getBlock(TargetId),
                $DOMTargetBlocks = $DOMTarget.find(' > .Blocks'),
                ParentBlock = AP.Model.getBlock(TargetId),
                NewBlock = AP.Model.getBlock(NewBlockId),
                BlockTemplateId = NewBlock.get('Template') || 'block', // Default Block template
                HTMLBlock = me.Templates.renderTemplate(BlockTemplateId, NewBlock),
                DOMBlocksExists = $DOMTargetBlocks.length > 0,
                $DOMBlockParent;

            if (DOMBlocksExists) {

                $DOMBlockParent = $DOMTargetBlocks.eq(0);
            } else {

                var BlocksTemplateId = NewBlock.get('BlocksTemplate') || 'blocks', // Default Blocks template
                    BlocksHTML = Me.Templates.renderTemplate(BlocksTemplateId, ParentBlock);

                $DOMBlockParent = $DOMTarget.append(BlocksHTML)
                                  .find('> .Blocks').eq(0);

                // publish DOM event
                $DOMTarget.trigger('blocksAdded');
            }

            $DOMBlockParent.append(HTMLBlock);

            var $Block = me.getBlock(NewBlockId);
            NewBlock.Widget && $Block.attr('data-widget', true);
            // Create nested blocks

            var ChildBlocks = NewBlock.get('Blocks');

            if (ChildBlocks && ChildBlocks.length > 0) {

                _.each(ChildBlocks, function (childBlock) {

                    me.renderBlock(NewBlockId, childBlock);
                });
            }

            /*If new block has a widget to render then mark it for creating widget after constructing DOM*/
            if (NewBlock.Widget) {

                $Block.data('parentid', TargetId);
                renderWidgetIn.call(this, NewBlockId);
            }
            // publish DOM event
            $DOMBlockParent.trigger('blockAdded');
        };

        // ------------------------------------------------------------------------------------
        // DOM

        // Remove child blocks from DOM
        AgilePointView.prototype.removeBlockChildren = function (BlockId, silent) {

            AP.View.getBlock(BlockId).find('> .Blocks > .Block').each(function () {

                var BlockId = $(this).attr('data-id');
                Me.removeBlock(BlockId, silent);
            });
        };

        //register windows with unique id
        AgilePointView.prototype.Windows = new objectStore();
        //register modules with unique id
        AgilePointView.prototype.Modules = new objectStore();

        // Remove block from DOM
        AgilePointView.prototype.removeBlock = function (BlockId, silent) {
            this.registry.forget(BlockId);
            this.removeBlockChildren(BlockId, silent);
            var $Block = this.getBlock(BlockId),
                $BlocksChild = $Block.find('> .Blocks'),
                $BlocksParent = $Block.parent('.Blocks').eq(0);

            // Destroy widget if Blocks node is widget
            if ($BlocksChild.length > 0) {
                var APWidget = $BlocksChild.data('APWidget');
                if (APWidget) { APWidget.destroy(BlockId); };
            };

            // Clear & remove Blocks node
            $BlocksChild.empty();
            $BlocksChild.remove()

            // Destroy widget if node is widget
            var MyAPWidget = $Block.data('APWidget');
            if (MyAPWidget) {
                MyAPWidget.destroy();
                $Block.removeAttr('data-id');
                $Block.removeAttr('id');
                $Block.removeClass('.APWidget');
            };

            // Clear & remove node
            $Block.empty();
            $Block.remove();

            // If silent then don't publish any events.
            if (silent) return;
            // publish DOM event
            $BlocksParent.trigger('blocksRemoved');
        };



        var renderWidgetIn = function (blockId) {
            /* Convert in widget */
            var me = this;
            var $Block = me.getBlock(blockId);
            var widget = AP.View.Widget.widgetize(blockId), args = { BlockId: blockId };
            $Block.data('APWidget', widget);

            // Some widgets need initialization from here
            if (widget.routeEvent) widget.routeEvent('init', args);
            else AP.Controller.route('event/init', args);


        };

        // Render blocks after load new chunk
        AgilePointView.prototype.onModelNewData = function (TargetId, NewBlocksIdList, Replace, Path) {
            var me = this;
            //If to replace, then silently remove the children
            if (Replace) { me.removeBlockChildren(TargetId, true); };

            _.each(NewBlocksIdList, function (NewBlockId) {
                me.renderBlock(TargetId, NewBlockId);
            });


            // Send Path rendered event
            AP.Controller.Events.View.onNewDataRendered.dispatch(Path);

            // (re)bind DOM root to Model.ViewModel
            AP.Controller.route('bind', { CanRepeat: true, target: me.getBlock(TargetId) });
        };

        AgilePointView.prototype._viewBuffer = [];

        AgilePointView.prototype._pushToBuffer = function (TargetId, NewBlocksIdList, Replace, Path, completed) {
            this._viewBuffer.push({
                TargetId: TargetId,
                NewBlocksIdList: NewBlocksIdList,
                Replace: Replace,
                Path: Path,
                completed: completed
            });
        };


        // Render blocks after load new chunk in asyncronous manner
        AgilePointView.prototype.onModelNewDataAsyncHandler = function (TargetId, NewBlocksIdList, Replace, Path, completed) {
            this._pushToBuffer.apply(this, arguments);
        };

        AgilePointView.prototype.renderFromBuffer = function (completed) {
            var me = this;
            async.eachSeries(this._viewBuffer, function (item, next) {
                me._processBuffer(item.TargetId, item.NewBlocksIdList, item.Replace, item.Path, function () {
                    async.nextTick(next);
                });
            }, completed);
        };

        AgilePointView.prototype._processBuffer = function (TargetId, NewBlocksIdList, Replace, Path, completed) {
            var me = this;
            //If to replace, then silently remove the children
            if (Replace) { me.removeBlockChildren(TargetId, true); }

            async.eachSeries(NewBlocksIdList, function (NewBlockId, next) {
                me.renderBlockAsync(TargetId, NewBlockId).done(next);
            }, function () {
                // Send Path rendered event
                AP.Controller.Events.View.onNewDataRendered.dispatch(Path);

                // (re)bind DOM root to Model.ViewModel
                AP.Controller.route('bind', { CanRepeat: true });

                completed && completed();

            });

        };

        // Render blocks after load new chunk
        AgilePointView.prototype.onLoadDNAQComplete = function (Path) {
        };
        AgilePointView.prototype._msgWindowManager = null;
        AgilePointView.prototype._confirmWindowManager = null;
        var createWindowManager = function (AP, eltSelector, getTitle, getContent) {
            return new AP.Utils.windowManager(AP, { eltSelector: eltSelector, getTitle: getTitle, getContent: getContent });
        };
        AgilePointView.prototype._getMsgWindowManager = function () {
            if (this._msgWindowManager) return this._msgWindowManager;
            return this._msgWindowManager = createWindowManager(AP, AP.Config.MessageWindowSelector || '.MessageWindow',
                function (options) { return options.title || AP.Config.Dialog.DefaultTitle || 'Error!'; },
                function (options) { return options.content || AP.Config.Dialog.DefaultContent || { template: 'An error has occured. Please try again later' }; }
            );
        };

        AgilePointView.prototype._getConfirmWindowManager = function () {
            if (this._confirmWindowManager) return this._confirmWindowManager;
            return this._confirmWindowManager = createWindowManager(AP, AP.Config.ConfirmWindowSelector || '.ConfirmWindow',
                function (options) {
                    return options.title || AP.Config.Dialog.DefaultTitle || 'Confirm';
                },
                function (options) {
                    return !_.isEmpty(options.content) && options.content || AP.Config.Dialog.DefaultConfirmContent || { template: 'Are you sure?' };
                }
            );
        };

        var showWindow = function (manager, options) {
            var resultCallback = null, cbStore = new Object;
            var chain = {
                result: function (resultCb) {
                    resultCallback = resultCb;
                }
            };
            var defConfig = {
                modal: true,
                resizable: false,
                appendTo: AP.Config.Data.WindowRenderTarget,
                result: function (e) {
                    resultCallback && resultCallback(e);
                    cbStore && cbStore.hasOwnProperty(e.action) && cbStore[e.action]();
                },
                actions: ['Close']
            };
            manager.show($.extend(true, defConfig, options));

            _.each(options.buttons || [], function (btn) {
                var key = btn.action || btn.text;
                chain[key] = function (cb) {
                    cbStore[key] = cb;
                    return chain;
                };
            });
            return chain;
        };
        AgilePointView.prototype.showMsg = function (options) {
            showWindow(this._getMsgWindowManager(), options);
        };

        var normalizeMessage = function (key) {
            var message = Me.Internationalize.translate(key);
            if (arguments.length > 1) {
                var args = _.toArray(arguments).slice(1);
                args.unshift(message);
                message = kendo.format.apply(kendo, args);
            }
            return message;
        };

        AgilePointView.prototype.showAlertKey = function (key) {
            this.showAlert(normalizeMessage.apply(this, arguments));
        };
        AgilePointView.prototype.showAlert = function (message) {
            showWindow(this._getMsgWindowManager(), { content: { template: message } });
        };
        AgilePointView.prototype.confirm = function (message, buttons, actions) {
            return showWindow(this._getConfirmWindowManager(), { content: { template: message }, buttons: buttons || [{ text: 'Ok' }, { text: 'Cancel' }], actions: actions || ['Close'] });
        };
        // Optional paramter 'actions' is added  so as able to include other window action maximize , minimize.
        AgilePointView.prototype.confirmKey = function (key, buttons, actions) {
            return Me.confirm(Me.Internationalize.translate(key), buttons, actions);
        };
        /*Retrives the jquery wrapped html dom element of the sent block id*/
        AgilePointView.prototype.getBlock = function (id) {
            return this.registry.get(id);
        };
        /*Shows progress overlaid on the specified html element*/
        AgilePointView.prototype.showProgress = function (blockId) {
            var $block = this.getBlock(blockId);
            $block.length && kendo.ui.progress($block, true);
        };
        /*Hides progress overlaid on the specified html element before*/
        AgilePointView.prototype.hideProgress = function (blockId) {
            var $block = this.getBlock(blockId);
            $block.length && kendo.ui.progress($block, false);
        };
        /*Notifies all the rendered or targeted and rendered within targeted widgets whenever the binding is applied.*/
        AgilePointView.prototype.notifyBind = function ($target) {
            var me = this;
            forEachWidgetIn(this.$ViewRoot, function (widget) {
                me.notifyBindOnWidget(widget);
            });
        };

        /*Notifies all the rendered or targeted and rendered within targeted widgets whenever the binding is applied.*/
        AgilePointView.prototype.notifyBindOnBlock = function ($target) {
            var me = this;
            forEachWidgetIn($target, function (widget) {
                me.notifyBindOnWidget(widget);
            });
        };

        /*Notifies */
        AgilePointView.prototype.notifyBindOnWidget = function (widget) {
            try {
                widget && widget.onViewModelBind && widget.onViewModelBind(); widget && widget.onViewModelBind && widget.onViewModelBind();
            } catch (e) {

            }
        };
        AgilePointView.prototype.refreshScrollables = function () {
            utilities.invokeAsync(this._scroll.makeScroll, this, ['.custom-scrollable']);
        };

        AgilePointView.prototype.notifyResize = function () {
            this.refreshScrollables();
            forEachWidgetIn(this.$ViewRoot, function (widget) {
                try {
                    widget && widget.onWindowResize && widget.onWindowResize();
                } catch (e) {

                }
            });
        };
        AgilePointView.prototype.notifyInteraction = function () {
            this.refreshScrollables();
            forEachWidgetIn(this.$ViewRoot, function (widget) {
                try {
                    widget && widget.onPageInteracted && widget.onPageInteracted();
                } catch (e) {

                }
            });
        };
        return AgilePointView;
    }
);

