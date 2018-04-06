
define(['ap/modules/view/widget/basewidget', 'async'],
    function (baseWidget, async) {

        'use strict';
        var DATABINDING = "dataBinding", DATABOUND = "dataBound", CHANGE = "change", SELECT_CHANGE = "selectionChanged";


        var Widget = kendo.ui.Widget, toggleBtnWidget = Widget.extend({
            _btn: null, _selected: false, _toggleId: null, $container: null,
            init: function (element, options) {
                Widget.fn.init.apply(this, arguments);
                //this.element.off('click');
                !this.element.attr('data-group-name') && this.element.attr('data-group-name', this.options.groupName);
                this.element.attr('data-group-name') && (this.options.groupName = this.element.attr('data-group-name'));

                //this.element.on('click', $.proxy(this.toggle, this));

                this.element.kendoButton();

                this.element.attr('data-toggle-id', this._toggleId = kendo.guid());
                this._btn = this.element.data('kendoButton');
                this._btn.bind('click', $.proxy(this._onClick, this));
            },
            _onClick: function (e) {
                e.preventDefault();
                this.toggle()
                return false;
            },
            options: {
                name: 'ToggleButton',
                groupName: 'Toggle',
                mode: 'toggle',
                //containerSel: '.APWidget',
                activeClassName: 'k-state-active'
            },
            events: [CHANGE, SELECT_CHANGE],
            _enabled: true,
            ///Enabled binding handler
            enable: function (enabled) {
                //this.element.prop('disabled', !enabled);
                //this.element.attr('aria-disabled', !enabled);
                //this.element[enabled ? 'removeClass' : 'addClass']('k-state-disabled');
                this._btn && this._btn.enable(enabled);
                this._enabled = enabled;
            },
            /// Disabled binding handler
            disable: function (disabled) {
                this.enable(!disabled);
            },
            ///the selected binding handler
            selected: function (val) {
                if (!this._enabled) return false;
                var me = this;
                if (arguments.length == 0) return me._selected;
                if (me._selected == val) return;
                me._selected = val;
                me.trigger(SELECT_CHANGE, { selected: val });
                me._selected ? me._toggleOn() : me._toggleOff();
            },
            ///Switches the button state to ON if Off and vice versa.
            ///If the mode is 'radio' the toggle wouldn't work on the element that is already ON
            toggle: function () {
                var proceed = true, selected = this.element.is('.' + this.options.activeClassName);

                switch (this.options.mode) {
                    case 'radio':
                        selected && (proceed = false);
                        break;
                }

                proceed && this._setSelected(!selected);
            }, _setSelected: function (val) {
                if (!this._enabled) return;
                var me = this, changed = me._selected != val;
                me.selected(val);
                //Let ViewModel know the changes occured to selected binding
                changed && me.trigger(CHANGE, { selected: val });
            },
            ///Gets the container to look for the members
            _getContainer: function () {
                if (!this.$container)
                    this.$container = this.options.containerSel ? this.element.parentsUntil(this.options.containerSel) : $(document.body);
                return this.$container;
            },
            _getGroupMembers: function () {
                var me = this;
                return this._getContainer().find('[data-role="togglebutton"][data-group-name="' + me.options.groupName + '"]')
                    .not('[data-toggle-id="' + me._toggleId + '"]');
            },
            ///Switches the button state to ON and switches its other group members Off
            _toggleOn: function () {
                if (!this._enabled) return;
                var me = this;
                me.element.addClass(me.options.activeClassName);
                var $members = this._getGroupMembers();
                $members.length > 1 && $members
                     .each(function () {
                         var $elt = $(this);
                         var widget = $elt.data('kendo' + me.options.name);
                         widget && widget._setSelected(false);
                     });

            },
            ///Switches the button state to Off
            _toggleOff: function () {
                if (!this._enabled) return;
                var me = this;
                me.element.removeClass(me.options.activeClassName);
            }
        });
        kendo.ui.plugin(toggleBtnWidget);
        var AgilePointWidgetsButton = baseWidget.extend({
            _getDefaultConfig: function () {
                return { self: false };
            },
            onInit: function (AgilePoint, BlockId) {
                var AP = AgilePoint, me = this;

                var Block = AP.Model.getBlock(BlockId);
                var Widget = Block.get('Widget');

                Widget.set('DOM', Widget.get('DOM') || 'button');

                this.$btn = this.$Block.prepend(AP.View.Templates.renderTemplate('widget/togglebutton', { AP: AP, BlockId: BlockId }))
                .find(Widget.get('DOM'));




                this.$Block.on('mouseenter', function () {
                    me.$Block.addClass('block-state-hover');
                });

                this.$Block.on('mouseleave', function () {
                    me.$Block.removeClass('block-state-hover');
                });

                if (Widget.get('Action')) {
                    this.$btn.attr('data-action', Widget.get('Action'));
                    this.$btn.on('click', function (e) {
                        AP.Controller.route('event/click', {
                            BlockId: BlockId,
                            e: e
                        });
                        return false;
                    });
                }
                var instance = this.$btn.kendoToggleButton(this._config).data('kendoToggleButton');
                instance.selected() && me.$Block.addClass('block-state-selected');

                this.$Block.on('click', '.Blocks', function () {
                    instance && instance.toggle();
                    instance.selected() ? me.$Block.addClass('block-state-selected') : me.$Block.removeClass('block-state-selected');

                });
                instance.bind(SELECT_CHANGE, function (e) {
                    async.nextTick(function () {
                        instance.selected() ? me.$Block.addClass('block-state-selected') : me.$Block.removeClass('block-state-selected');
                    });
                });
                this.translateTexts();
            },
            destroy: function () {
                var Block = this.AP.Model.getBlock(this.BlockId);
                if (Block == null) return;
                var Widget = Block.get('Widget');
                if (Widget == null) return;
                this.$Block.find(Widget.get('DOM')).off(this.BlockId);
                baseWidget.fn.destroy.apply(this, arguments);
            }
        });

        return { name: 'ToggleButton', widget: AgilePointWidgetsButton };
    }
);
