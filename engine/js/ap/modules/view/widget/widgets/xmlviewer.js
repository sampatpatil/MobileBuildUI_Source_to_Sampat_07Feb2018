
define(
[
     'ap/modules/view/widget/widgets/templatedWidget',
     'xmltree',

],

function (templatedWidget, mCustomScrollbar) {


    'use strict';

    var widget = templatedWidget.widget.extend({
        _tree: null,
        _getDefaultConfig: function () {
            return { loadingTemplate: '<div class="k-loading-image"></div>', contentClass: '', contentStatusClass: 'HasContent', customScroll: true, targetSelector: '.XmlViewer', expanded: false };
        },
        render: function (data) {
            this._data = _.trim(data);

            var AP = this.AP, args = { AP: AP, BlockId: this.BlockId, Data: data };
            this.AP.Controller.route('event/render', args);

            if (args.Data) {
                this.$holder.html(this._config.template ? AP.View.Templates.renderTemplate(this._config.template, {
                    AP: this.AP, result: args.Data, QueryId: this.QueryId, config: this._config
                }) : '<div class="XmlViewer"></div>');
                this.$Block.addClass(this._config.contentStatusClass);
            }
            else {
                this.$holder.html(this._config.defaultContent || '');
                this.$Block.removeClass(this._config.contentStatusClass);
            }
            this._createWidgets();
            this.isInTabStrip();
            this._setupEventHandlers();
            if (this._config.rebindOnRender) this.AP.Controller.route('bind', { target: this.$Block });
            this._config.customScroll && this.resizeScroll();
        },
        _createWidgets: function () {
            var me = this;
            if (me._data) {
                (this._tree = new XMLTree({ container: me.$holder.find(this._config.targetSelector)[0], xml: me._data, startExpanded: me._config.expanded }));
                this.hideMessage();
                this._config.customScroll && this.resizeScroll();
            }
            else this.showMessageKey(this._config.defaultMessage);

        },

        resizeScroll: function () {
            templatedWidget.widget.fn.resizeScroll.call(this, this._config.targetSelector);
        }
    });
    return { name: 'XmlViewer', widget: widget };
});
