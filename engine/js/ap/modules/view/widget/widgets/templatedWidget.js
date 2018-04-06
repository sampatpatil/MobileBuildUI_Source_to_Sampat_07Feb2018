
define(
[
     'ap/modules/view/widget/basewidgetwithtabstrip',
     'lib/modules/nicescroll',

],

function (basewidgetwithtabstrip, mCustomScrollbar) {


    'use strict';

    var creatableWidgets = [{ role: 'tooltipex', widget: 'kendoTooltipEx' }, { role: 'tooltip', widget: 'kendoTooltip' }];

    var widget = basewidgetwithtabstrip.extend({
        _dataSrcConfig: {}, _data: null, _response: null, $holder: null, $Buttons: null, _callbacks: null,
        _getChildren: function () {
            return this.$Block.find('> .Blocks > .APWidget');
        },
        _getDefaultConfig: function () {
            return { loadingTemplate: '<div class="k-loading-image"></div>', contentClass: '', contentStatusClass: 'HasContent', customScroll: false };
        },
        onDataSourceReady: function (e, r) {
            this._processResponse(r);
        },
        onVisibilityChanged: function (visible) {
            visible && this.resizeScroll();
        },
        onWindowResize: function () {
            this._config.customScroll && this.resizeScroll();
        },
        onPageInteracted: function () {
            //this._config.customScroll && this.resizeScroll();
        },
        onInit: function (AP, BlockId) {
            var Block = AP.Model.getBlock(BlockId), type = Block.Type || '', me = this, contentClass = 'WidgetContent',
                csel = '> .' + contentClass, chTemplate = '<div class="' + contentClass + ' ' + this._config.contentClass + '"></div>',
                config = this._config;
            this.$holder = this.$Block.find(csel);
            if (Block.get('Widget.HasChildren')) {
                (this.$holder.length == 0) && $(chTemplate).insertBefore(this.$Block.find('> .Blocks'));
            }
            else this.$Block.append(chTemplate);

            this.$holder = this.$Block.find(csel);
            if (this.QueryId) {
                AP.Config.loadQuery(this.QueryId);
                if (_.isObject(config.loadingTemplate)) {
                    config.loadingTemplate = AP.View.Templates.renderTemplate(config.loadingTemplate, Block);
                }
                this.buildDatasource(null, this._config.autoRead);
            }
            else if (this._config.template) this.render(Block);
            this._setTitle();
        },
        refresh: function (extradata, rebuild, refreshChildren) {
            if (rebuild) this.buildDatasource(extradata, this._config.autoRead);
            if (this._dataSource) this._dataSource.read();
            if (refreshChildren) this.refreshChildren();
            this.isInTabStrip();
        },
        refreshChildren: function (extradata, next, rebuild) {
            this.AP.Utils.loopAsync(this._getChildren(), function (elt, inext) {
                var $elt = $(elt);
                if (next) { next($elt); }
                else {
                    var widget = $elt.data('APWidget');
                    if (widget && widget.refresh) widget.refresh(extradata, rebuild);
                }
                inext();
            });
        },
        _clickHandler: function (e) {
            if (!$(e.currentTarget).is(':disabled')) {

                this.routeEvent('button', {
                    e: e,
                    data: this._data,
                    CanRepeat: true
                });
            }
            return false;
        },
        _setupEventHandlers: function () {
            var me = this;
            //this.$Buttons = this.$holder.find('.Buttons');

            //this.$Buttons.find('.k-button').not('[data-skip-click=true]').on('click', $.proxy(this._clickHandler, this));

            this.$Block.on('click', '[data-action]', $.proxy(this._clickHandler, this));
        },
        render: function (data) {
            this._data = data;
            var AP = this.AP, args = { AP: this.AP, BlockId: this.BlockId, Data: data };
            this.routeEvent('render', args); // routing the event through the event handler
            // this.AP.Controller.route('event/render', args);

            if (args.Data) {
                this.$holder.html(AP.View.Templates.renderTemplate(this._config.template, {
                    AP: AP, result: args.Data, QueryId: this.QueryId, config: this._config
                }));
                this.$Block.addClass(this._config.contentStatusClass);
            }
            else {
                this.$holder.html(this._config.defaultContent || '');
                this.$Block.removeClass(this._config.contentStatusClass);
            }
            this._createWidgets();
            this.isInTabStrip();
            this.routeEvent('afterRender', args);
            this._setupEventHandlers();

            if (this._config.rebindOnRender) this.AP.Controller.route('bind', { target: this.$Block });
            this._config.customScroll && this.resizeScroll();
        },
        _createWidgets: function () {
            var me = this;
            _.each(creatableWidgets, function (cw) {
                var args = { options: {} };
                me.routeEvent('createWidget', args);
                me.$holder.find('[data-role="' + cw.role + '"]')[cw.widget](args.options);
            });
        },
        requeststart: function () {
            this.$holder.html(this._config.loadingTemplate);
        },
        setData: function (data, response, notifyDependables) {
            var block = this.AP.Model.getBlock(this.BlockId);
            if (!block) return;
            var queries = block.get('Widget.Dependables.Queries');
            notifyDependables = notifyDependables == null ? true : notifyDependables;
            if (!queries || !notifyDependables) return;
            var d = this._data || data, r = this._response || response;
            this.notifyDependables(d, r);
        },
        requestend: function (e) {
            this.$Block.trigger('requestend', e);
            this._processResponse(e);
        },
        _processResponse: function (e) {
            var data = this._response = e.response;
            try { this._data = this._dataSource.options.schema.parse(this._response) }
            catch (ex) { this._data = data; }
            this.render(this._data);
            this.setData();
        },
        destroy: function () {
            basewidgetwithtabstrip.fn.destroy.apply(this, arguments);
            this._data = null;
            this._response = null;
            this._callbacks = null;
            this._clickHandler = null;
        }
    });
    return { name: 'TemplatedWidget', widget: widget };
});
