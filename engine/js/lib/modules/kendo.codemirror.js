define(['kendo', 'cm/lib/codemirror', 'cm/mode/javascript/javascript', 'cm/mode/css/css'], function (k, CodeMirror, javascript, css) {

    var DATABINDING = "dataBinding", DATABOUND = "dataBound", CHANGE = "change", Widget = kendo.ui.Widget;

    return Widget.extend({
        _editor: null,
        options: {
            name: 'CodeMirror',
            lineNumbers: true,
            mode: "javascript"
        },
        init: function (options) {
            Widget.fn.init.call(this, options);
            this.refresh();
        },

        _triggerChange: function () {
            var me = this;
            if (me._editor) return;
            me.$element.trigger('change', me._editor.getValue());
            me.trigger('change', { field: 'value' });
        },
        value: function (text) {
            var me = this;
            if (text) {
                me.setText(text);
                return;
            }
            return me._editor.getValue();
        },
        setConfig: function (options) {
            var me = this;
            if (!options) return;
            me.options = $.extend(true, {}, me.options, options);
            me._applyOptions();
        },
        _applyOptions: function () {
            var me = this;
            me._editor && _.each(me.options, function (v, k) {
                me._editor.setOption(k, v);
            });
        },
        setText: function (text) {
            var me = this;
            if (me._editor) return;
            text = text || '';
            me._editor.setValue(text);
        },
        refresh: function () {
            var me = this;
            if (me._editor) return;
            me._editor = CodeMirror.fromTextArea(this.element[0], this.options);
            me._applyOptions();
            me._editor.on('change', function () {
                me._triggerChange();
            });
        }
    });

});