
define(['ap/modules/view/widget/widgets/timer'],

function (timer) {

    'use strict';
    var AgilePointWidgetsClock = timer.widget.extend({
        onInit: function (AP, BlockId) {
            var Block = AP.Model.getBlock(BlockId),
                $WidgetBlock = $('#' + BlockId).html('');
            var defaultConfig = { interval: 1000, TimeFormat: 'hh:mm:ss tt', DateFormat: 'dddd d MMMM, yyyy', ShowTime: true, ShowDate: false, Suffix: '', Prefix: '', ShowTimeZone: true, ShowUTC: false };
            var config = Block.get('Widget.Config') || {};
            this._config = $.extend(defaultConfig, config);
            this.start();
        },
        $date: null, $time: null, $prefix: null, $suffix: null, $timezone: null,
        _discover: function () {
            var config = this._config;
            if (this.$date) return;
            this.$prefix = $('<span class="Prefix"></span>').html(config.Prefix).appendTo(this.$Block);
            this.$date = $('<span class="APClockDate"></span>').appendTo(this.$Block);
            this.$time = $('<span class="APClockTime"></span>').appendTo(this.$Block);
            this.$timezone = $('<span class="TZ"></span>').appendTo(this.$Block);
            this.$suffix = $('<span class="Suffix"></span>').html(config.Suffix).appendTo(this.$Block);
        },
        _onTick: function () {
            var now = new Date(), config = this._config;
            this._discover();
            if (config.ShowUTC) now.setUTCMinutes(now.getTimezoneOffset());

            var nowTime = kendo.toString(now, config.TimeFormat),
                nowDate = kendo.toString(now, config.DateFormat);
            config.ShowDate && this.$date.html(nowDate + '&nbsp;');
            config.ShowTime && this.$time.html(nowTime);

            config.ShowTimeZone && this.$timezone.html('(UTC ' + now.getTimezoneOffset() / 60 + ')');
        }
    });

    return { name: 'Clock', widget: AgilePointWidgetsClock };
}
);
