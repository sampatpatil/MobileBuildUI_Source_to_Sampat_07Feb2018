
define(

    [
         'ap/modules/view/widget/basewidgetwithdatasource',
         'lib/modules/kendo/kendo.tabstrip',
         'kendoEx',		// Kendo Libs
         'lib/modules/utilities'
    ],

    function (baseWidgetWithDataSource, K, K1, utils) {

        'use strict';

        var AP;

        var buildReorderableTabstrip = function () {

            return kendo.ui.TabStripOld.extend({
                _id: '',
                options: {
                    name: 'ReorderableTabStrip'
                },
                init: function (element, options) {
                    this._id = kendo.guid();
                    //element.kendoBindingTarget = APPS[0].Model.ViewModel;
                    kendo.ui.TabStripOld.fn.init.apply(this, arguments);
                    this.applyReorderable();
                },
                _updateContentElements: function () {
                    var t = this;
                    (!t.element.attr('id') && t.element.attr('id', t._id));
                    kendo.ui.TabStripOld.fn._updateContentElements.apply(this, arguments);
                },
                applyReorderable: function () {

                    this.tabGroup.kendoReorderable({
                        group: 'tabs',
                        filter: '.k-item',
                        hint: function (element) {

                            return element.clone()
                                   .wrap('<ul class="k-tabstrip-items k-reset"/>')
                                   .parent()
                                   .css({ opacity: 0.8 });
                        },
                        change: $.proxy(this.onReorderableChange, this)
                    });
                },

                onReorderableChange: function (event) {

                    if (event.newIndex < event.oldIndex) {

                        this.tabGroup.children('.k-item:eq(' + event.newIndex + ')').before(this.tabGroup.children('.k-item:eq(' + event.oldIndex + ')'));
                        this.element.children('.k-content:eq(' + event.newIndex + ')').before(this.element.children('.k-content:eq(' + event.oldIndex + ')'));
                    } else {

                        this.tabGroup.children('.k-item:eq(' + event.newIndex + ')').after(this.tabGroup.children('.k-item:eq(' + event.oldIndex + ')'));
                        this.element.children('.k-content:eq(' + event.newIndex + ')').after(this.element.children('.k-content:eq(' + event.oldIndex + ')'));
                    }
                    this._updateClasses();
                }
            });
        };

        kendo.ui.plugin(buildReorderableTabstrip());

        var wid = baseWidgetWithDataSource.extend({
            _selectedTabIndex: null,
            _getDefaultConfig: function () {
                return {
                    theme: '',
                    minTabs: 1,
                    activate: $.proxy(this._updateVMOnActivate, this),
                    animation: {
                        close: {
                            duration: 100,
                            effects: "fadeOut"
                        },
                        open: {
                            show: true,
                            duration: 100,
                            effects: "fadeIn"
                        }
                    }
                };
            },
            onInit: function (AP, BlockId) {

                var Me = this;
                this.$Block
                .on('blockAdded', '> .Blocks', function () {
                    /*Me.$Block.find(' > .Blocks')
                    .on('blockAdded', function () {*/
                    //var t = utils.invokeAsync(function () { Me.widgetize(); }, 100);
                    Me.widgetize();
                    // });
                })
                .on('blocksRemoved', function () {
                    //var t = utils.invokeAsync(function () { Me.widgetize(); }, 100);
                    Me.widgetize();
                });
                this.widgetize();
            },

            _updateVMOnActivate: function () {
                var $block = this.KendoWidget.select();
                var block = this.AP.Model.getBlock(this.BlockId);
                (block != null && block.Widget && (block.Widget.SelectedIndex != null)) && block.set('Widget.SelectedIndex', $block.index());
                this.notifyTabActivation();
            },

            // -----------------------------------------------------------------------------------

            widgetize: function () {

                var Me = this, AP = Me.AP,
                    $BlocksSlot = this.$Block.find(' > .Blocks'),
                    $StripBlocks = $BlocksSlot.find(' > .Block');
                var theme = this._config.theme ? this._config.theme + '-theme' : '';
                theme && ($BlocksSlot.removeClass(theme), $BlocksSlot.addClass(theme));
                this.reset();
                var $TabBar = ($BlocksSlot.length > 0 ? $BlocksSlot : this.$Block).prepend('<ul class="TabBar plain-list"></ul>').find(' > ul');

                var tools = this._config.Tools;


                if ($StripBlocks.length != 0) {

                    $StripBlocks.each(function () {

                        var $this = $(this),
                            $BlockFields = $this.find('> .Fields'),
                            HaveFields = $BlockFields.length > 0;

                        if (!HaveFields && !$this.is('[data-tab-tools]')) {

                            var NoFieldsHTML = AP.View.Templates.renderTemplate('blockfields', { AP: AP, Create: true });
                            $BlockFields = $($.trim(NoFieldsHTML));

                        } else {
                            var bflds = $BlockFields.show().clone();
                            $BlockFields.hide();
                            $BlockFields = bflds;
                        }
                        $BlockFields.find('>[data-role="inplaceeditor"]').each(function () {
                            var $elt = $(this);
                            $elt.kendoinplaceeditor();
                            $elt.off('change');
                            $elt.on('change', $.proxy(function (e, val) {
                                try {
                                    var wid = this.$Block.find('>.Blocks>.Block:eq(' + $(e.currentTarget).parents('li:first').index() + ')').data('APWidget');
                                    if (wid && wid.QueryId) {
                                        var vm = AP.Config.loadQuery(wid.QueryId);
                                        vm && vm.set('Title', val);
                                    }
                                }
                                catch (e) { }
                            }, Me));
                        });
                        $BlockFields = $BlockFields.wrap('<li></li>').parent();

                        if (Me._config.Tools && Me._config.Tools.Remove) {

                            var ButtonData = $.extend({ AP: AP }, Me._config.Tools.Remove),
                                RemoveButtonHTML = AP.View.Templates.renderTemplate('widget/tabsbutton', ButtonData);
                            var $removeButton = $($.trim(RemoveButtonHTML));
                            $BlockFields.append($removeButton);
                            if ($StripBlocks.length == 1) $removeButton.hide();
                        }

                        $TabBar.append($BlockFields);

                        $this.addClass('InTabStrip');
                    });
                    this.AP.Controller.route('bind', { target: $BlocksSlot });
                    $BlocksSlot.kendoReorderableTabStrip(this._config);


                    this.KendoWidget = $BlocksSlot.data('kendoReorderableTabStrip');

                    if (this.KendoWidget) {
                        var $lis = $TabBar.find('li');
                        var $LastTab = $lis.last();
                        var me = this;
                        $.each(this.KendoWidget.items(), function (idx, item, length) {
                            $('#' + $(item).attr('aria-controls')).hide();
                        });
                        var di = this._config.defaultItem;
                        me.KendoWidget.select(di != null ? di : me.KendoWidget.items().length - 1);
                    }
                };





                // Tools setup
                if (tools) {

                    for (var toolkey in tools) {
                        if (tools[toolkey].skip) continue;
                        var ButtonData = $.extend({ AP: AP }, tools[toolkey]),
                        AddButtonHTML = AP.View.Templates.renderTemplate('widget/tabsbutton', ButtonData);
                        var $addButtonWrapper = $('<li/>').append($.trim(AddButtonHTML));
                        $addButtonWrapper.addClass('tabTool');
                        $TabBar.append($addButtonWrapper);
                    }

                    var Me = this;

                    this.$Block.find('.TabButton,.clickable')
                    .on('click', function (e) {

                        var $e = $(e.currentTarget),
                            KeyTitle = $e.attr('data-text-key'),
                            Title = KeyTitle && AP.View.Internationalize.translate(KeyTitle) || '';
                        var args = {
                            Title: Title,
                            e: e,
                            handled: false,
                            CanRepeat: true
                        }
                        Me.routeEvent('click', args);
                        if (!args.handled) {
                            var action = $e.attr('data-action');
                            switch (action) {
                                case 'removetab':
                                    var $tabs = Me.KendoWidget.items();
                                    if ($tabs.length - 1 <= Me._config.minTabs) return;
                                    var $Tab = $e.parents('li.k-item').eq(0),
                                $Tabs = $Tab.siblings().andSelf(),
                                TabIndex = $Tabs.index($Tab),
                                $TabBar = $Tab.parent('ul'),
                                $BlockToRemove = $TabBar.siblings().filter('.k-content').eq(TabIndex),
                                BlockToRemoveId = $BlockToRemove.attr('data-id');
                                    AP.View.removeBlock(BlockToRemoveId);
                                    AP.Model.removeBlock(BlockToRemoveId);
                                    break;
                            }
                        }
                        return false;
                    });

                    this.$Block.find('input[type=text][data-enter-key-action]').on('keyup', function (e) {
                        if (e.keyCode == 13) {
                            var $this = $(this), isActive = $this.attr('disabled') != 'disabled',
                                action = $this.data('enter-key-action');

                            if (!isActive) return false;
                            e.preventDefault();
                            me.routeEvent(action, {
                                e: e,
                                Key: 'enter',
                                IsKeyEvent: true,
                                CanRepeat: true
                            });
                        };
                        return false;
                    });

                    // Translation on tool buttons

                    this.translateTexts();
                };

                if ($StripBlocks.length != 0) {

                    $StripBlocks.each(function (i) {

                        var $this = $(this),
                            $ThisWidget = $this.data('APWidget');

                        $this.attr('data-in-tab-index', i);

                        if ($ThisWidget && $ThisWidget.isInTabStrip) { $ThisWidget.isInTabStrip(); }
                    });
                };
                this.AP.Controller.route('bind', { target: this.$Block });
                this.routeEvent('resurrected');
            },

            // -----------------------------------------------------------------------------------
            // Get the current active tab index
            getSelectedTabIndex: function (i) {
                var me = this;
                return (me._selectedTabIndex == null) ? -1 : me._selectedTabIndex;
            },

            selectTab: function (i) {
                this.KendoWidget && this.KendoWidget.select(i);
            },

            notifyTabActivation: function () {
                var me = this;
                this.$Block.find('.APWidget').each(function () {
                    var widget = $(this).data('APWidget');
                    widget && widget.onTabActivated && widget.onTabActivated();
                });
                var $elt = this.KendoWidget.select();
                me._selectedTabIndex = $elt.index();

                me.resizeScroll();

                this.routeEvent('tabChange', {
                    selectedItem: $elt,
                    selectedIndex: $elt.index(),
                    CanRepeat: true
                });
            },

            getSelectedWidget: function () {

                // return widget inside selected tab
                var $TabSelected = this.KendoWidget.select(),
                    TabSelectedIndex = $TabSelected.index(),
                    $SelectedBlock = this.$Block.find('> .Blocks > .Block').eq(TabSelectedIndex),
                    SelectedWidget = $SelectedBlock.data('APWidget');

                return SelectedWidget;
            },

            getSelectedKendoWidget: function () {

                // return widget inside selected tab
                var SelectedWidget = this.getSelectedWidget(),
                    SelectedKendoWidget = SelectedWidget.KendoWidget;

                return SelectedKendoWidget;
            },

            // -----------------------------------------------------------------------------------
            remove: function (e) {
                this.KendoWidget && this.KendoWidget.remove(e);
            },
            reset: function () {

                var AP = this.AP, $AddTab = this.$Block.find('.addtab'),
                    $BlocksSlot = this.$Block.find(' > .Blocks'),
                    $StripBlocks = $BlocksSlot.find(' > .Block'),
                    $TabBar = $BlocksSlot.find(' > ul');

                $AddTab.off();
                $AddTab.remove();
                $TabBar.find('*').off();
                $TabBar.remove();

                $StripBlocks.each(function () {

                    var $this = $(this),
                        Id = $this.attr('data-id');
                    $this.attr('style', '');//clear styles
                    if (Id) $this.attr('id', Id); // Restore ids

                    AP.Utils.removeKendoClasses($this); // Remove kendo classes
                });

                AP.Utils.removeKendoClasses($BlocksSlot);
                $BlocksSlot.removeAttr('data-role');
            },

            // -----------------------------------------------------------------------------------

            translateTexts: function () {
                var AP = this.AP;
                // Tool buttons
                this.$Block.find('*[data-text-key]')
                .each(function () {

                    var $this = $(this),
                        KeyText = $this.attr('data-text-key'),
                        Text = AP.View.Internationalize.translate(KeyText);

                    $this.attr('title', Text);
                });
            },

            // -----------------------------------------------------------------------------------

            destroy: function () {
                this.$Block.off('blocksAdded');
                this.$Block.off('blocksRemoved');
                this.reset();
                baseWidgetWithDataSource.fn.destroy.apply(this, arguments);
                if (this.KendoWidget == null) return;
                this.KendoWidget.destroy();
            },

            resizeScroll: function () {
                var $widgets = this.$Block.find('.k-state-active.APWidget, .k-state-active .APWidget');
                baseWidgetWithDataSource.fn.resizeScroll.call(this, '.custom-scrollable:not(.k-content)');
                $widgets.each(function () {
                    var widget = $(this).data('APWidget');
                    widget.constructor.fn.hasOwnProperty('resizeScroll') && widget.resizeScroll();
                });
            },

            _getScrollContainer: function (selector) {
                selector = selector || '.k-content';
                return this.$Block.find(selector);
            }
        });

        return { name: 'ReorderableTabStrip', widget: wid };
    }
)
