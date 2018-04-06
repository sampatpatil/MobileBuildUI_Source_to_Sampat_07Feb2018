define(['ap/modules/view/widget/basewidget'],

function (basewidget) {

    'use strict';
    var wid = basewidget.extend({
        _handler: null, QueryId: null, PropPath: null, _tick: 0,
        onInit: function (AP, BlockId) {
            var block = AP.Model.getBlock(BlockId), config = block.get('Widget.Config')
            config = config && config.toJSON ? config.toJSON() : config;
            var defaultConfig = { autoStart: true, interval: 1000 };
            this._config = $.extend(true, {}, defaultConfig, config || {});
            this.QueryId = this._config.QueryId;
            if (this.QueryId) {
                this.PropPath = this._config.PropPath || 'TickCount';
            }
            this._config.autoStart && this.start();
        },
        start: function () {
            this.stop();
            this._tick = 0;
            this._handler = setInterval($.proxy(this._onTick, this), this._config.interval);
            this.routeEvent('started', { BlockId: this.BlockId });
        },
        _onTick: function () {
            ++this._tick
            if (this._config.QueryId && this.PropPath) {
                var vm = this.AP.Config.loadQuery(this.QueryId);
                vm.set(this.PropPath + '.Max', this._config.maxTicks);
                vm.set(this.PropPath + '.Passed', this._tick);

            }
            this._config.maxTicks && (this._tick > this._config.maxTicks) && this.stop();
        },
        stop: function (silent) {
            if (this._handler == null) return;
            window.clearInterval(this._handler);
            this._handler = null;
            !silent && this.routeEvent('stopped', { BlockId: this.BlockId, ticks: this._tick });
        },
        destroy: function () {
            this.stop(true);
            basewidget.fn.destroy.apply(this, arguments);
        }
    });
    return { name: 'Timer', widget: wid };
});