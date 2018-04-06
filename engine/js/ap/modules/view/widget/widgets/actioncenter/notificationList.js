define(['kendo', 'lib/modules/nicescroll'], function () {
    var CHANGE = 'change', ADD = 'add', REMOVE = 'remove', RENDERERKEY = 'renderer', baseRenderer = kendo.Class.extend({
        view: null,
        options: {
            template: '',
            model: {},
            fx: 'slideInLeft'
        },
        _fx: null,
        _entryfx: null,
        init: function (options) {
            this.options = options = $.extend(true, {}, this.options, options);
            this.view = new kendo.View(options.template, { model: options.model });
            this.onInit.apply(this, arguments);
        },
        _setupFx: function () {
            (!this._fx) && (this._fx = kendo.fx(this.view.element));
            return this._fx;
        },
        _getFx: function () {
            var fx = this._setupFx();
            if (!this._entryfx) this._entryfx = fx[this.options.fx]().add(fx.zoom().startValue(0.3).endValue(1.0));
            return this._entryfx;
        },
        _runEntryFx: function () {
            return this._getFx().stop().play();
        },
        _runExitFx: function () {
            return this._getFx().stop().reverse();
        },
        onInit: function () {

        },
        render: function ($container) {
            if (!this.view) return;
            $container.data(RENDERERKEY, this);
            this.view.render($container);
            //this._runEntryFx();
        },
        remove: function () {
            this._runExitFx().then($.proxy(function () {
                this.view.destroy();
            }, this));
        },
        destroy: function () {
            this.view.destroy();
        }
    });
    var renderers = {
        notification: baseRenderer.extend({ options: { template: '' } }),
        bulkAction: baseRenderer.extend({ options: { template: '' } }),
        action: baseRenderer.extend({ options: { template: '' } }),
        error: baseRenderer.extend({ options: { template: '' } })
    }, colletionActionMapping = { add: '_onItemsAdded', remove: '_onItemsRemoved' };
    var Widget = kendo.ui.Widget, listbox = Widget.extend({
        element: null, dataSource: null, _silent: false,
        $container: null, _src: null, _skipTransitions: false,
        events: [ADD, REMOVE],
        options: {
            name: 'NotificationList',
            autoBind: true,
            globalActions: ['clearAll'],
            itemsContainerTemplate: '<div class="items-container"></div>',
            itemContainerTemplate: '<div class="item" data-uid="#=data.uid#"></div>',
            itemTemplates: {
                notification: 'item1',
                bulkAction: '',
                action: '',
                error: ''
            }
        },
        init: function (element, options) {
            Widget.fn.init.apply(this, arguments);
            this.$container = this.element.find('.items-container');
            if (!this.$container.length) {
                this.$container = $(this.options.itemsContainerTemplate);
                var $actions = $('<div class="global-actions"></div>');
                this.options.globalActions.forEach(function (action) {
                    $actions.append(kendo.format('<button class="k-button pull-right {0}" data-action="{0}">Clear all</button>', action));
                });
                $actions.appendTo(this.element);
                this.$container.appendTo(this.element);
            }
            this._dataSource();
            this._setupEventHandlers();
        },
        _onItemLoaded: function (e) {
            var $elt = $(e.target);
            if (!$elt.is('.item')) return;
            var renderer = $elt.data(RENDERERKEY);
            if (!renderer || this._skipTransitions) return;
            renderer._runEntryFx();
        },
        _setupEventHandlers: function () {
            this.$container.on('DOMNodeInserted', $.proxy(this._onItemLoaded, this));
            this.element
                .on('click', '[data-action=close]', $.proxy(function (e) {
                    e.preventDefault();
                    this._removeItem($(e.currentTarget).parents('.item[data-uid]').first());
                }, this))
                .on('click', '[data-action=clearAll]', $.proxy(function (e) {
                    e.preventDefault();
                    this.clearAll();
                }, this));
        },
        _removeItem: function ($item) {
            var renderer = $item.data(RENDERERKEY);
            renderer && (renderer.remove(), this.dataSource.remove(renderer.view.model));

        },
        clearAll: function () {
            var me = this;
            me.items().forEach(function (item) {
                item.remove();
                me.dataSource.remove(item.view.model);
            });
        },
        _setupScroll: function () {
            var scrolls = this.$container.getNiceScroll();
            !scrolls.length && (scrolls = this.$container.niceScroll());
            scrolls.resize();
        },
        _onSrcCollectionChanged: function (e) {
            var action = '_onItemsChanged';
            colletionActionMapping.hasOwnProperty(e.action) && (action = colletionActionMapping[e.action]);
            this[action](e.items);
            this._setupScroll();
        },
        _onItemsChanged: function (items) {
            //Fired as soon a property of an item is changed.
        },

        _generateItemContainer: function (item) {
            !this._compiled && (this._compiled = kendo.template(this.options.itemContainerTemplate));
            var itemContainer = $(this._compiled(item));
            return itemContainer;
        },
        _onItemsAdded: function (items) {
            var me = this;
            _.each(items, function (item) {
                var $container = me._generateItemContainer(item);
                var renderer = new renderers[item.type]({ model: item, template: me.options.itemTemplates[item.type](item) });
                //if an item is an action and is not started yet, then start it.
                item.start && (item.status == -1) && item.start();
                //$container = me.$container.prepend($container).find(kendo.format('[data-uid="{0}"]', item.uid));                
                renderer.render($container);
                (!me._silent) && me.trigger(ADD, { item: item, renderer: renderer });
                me.$container.prepend($container)
            });
        },
        _itemsToContainers: function (items) {
            return this.$container.find(_.map(items, function (item) {
                return '[data-uid="' + item.uid + '"]';
            }).join(',')) || [];
        },
        items: function () {
            return this._itemsToRenderers(this.dataSource.view());
        },
        _itemsToRenderers: function (items) {
            var me = this;
            return _.map(items, function (item) {
                return me.$container.find('[data-uid="' + item.uid + '"]').data(RENDERERKEY);
            }).filter(function (item) { return item != null; });
        },
        _onItemsRemoved: function (items) {
            var me = this;
            this._itemsToContainers(items).each(function () {
                var $this = $(this);
                var renderer = $this.data(RENDERERKEY);
                renderer.remove();
                (!me._silent) && me.trigger(REMOVE, { renderer: renderer });
            });
        },
        prepareContainer: function () {
            this.$container.empty();
            _.each(this.items(), function (item) {
                item && item.destroy();
            });
        },
        refresh: function (skipTransitions) {
            this._skipTransitions = skipTransitions || false;
            this._silent = true;
            var that = this,
                view = that.dataSource.view();
            _.each(this.items(), function (item) {
                item && item.destroy();
            });
            this.$container.empty();
            this._onItemsAdded(view);
            this._silent = this._skipTransitions = false;
        },

        _dataSource: function () {

            var that = this;

            // returns the datasource OR creates one if using array or configuration object
            that.dataSource = kendo.data.DataSource.create(that.options.dataSource);

            // bind to the change event to refresh the widget
            that.dataSource.bind(CHANGE, function (e) {
                that._onSrcCollectionChanged(e);
            });

            if (that.options.autoBind) {
                that.dataSource.fetch();
            }
        },
        destroy: function () {
            this._src && this._src.unbind('change');
            this.$container.remove();
        }
    });
    kendo.ui.plugin(listbox);
    return { renderers: renderers };
});