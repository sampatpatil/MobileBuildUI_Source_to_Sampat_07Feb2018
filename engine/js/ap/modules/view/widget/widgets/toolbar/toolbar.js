define(
    ['lib/modules/utilities', 'ap/modules/view/widget/basewidget', 'templateStore'],

    function (utils, basewidget, templateStore) {

        'use strict';

        // A list of buttons

        var AgilePointWidgetsToolBar = basewidget.extend({
            _getDefaultConfig: function () {
                return {
                    EnableButtonsExtender: false,
                    standalone: false,
                    maxButtons: 2
                };
            },
            onInit: function (AP, BlockId, NonViewModel) {


                var Block = AP.Model.getBlock(BlockId) || NonViewModel,
                    me = this;

                var html = AP.View.Templates.renderTemplate(this._config.template || 'widget/toolbar/toolbar', {
                    AP: AP,
                    BlockId: BlockId,
                    Model: NonViewModel
                });


                this.$Block
                    .append(html);

                if (Block.Config) {
                    this._config.EnableButtonsExtender && (this.ButtonsExtender = this.$Block.kendoButtonsExtender(this._config));
                }

                if (this._config.standalone) {
                    this.$Block.on('click', '[data-action]', $.proxy(this._click, this));

                    // Enter key event listener for textbox.
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
                }
                this.translateTexts();
            },
            //Click handler for actionable buttons
            _click: function (e) {
                e.preventDefault();
                this.routeEvent('click', {
                    e: e
                });
            },

            activateButtons: function (ActionsList) {

                if (ActionsList) {
                    for (var ActionIndex in ActionsList) {
                        this.button(ActionsList[ActionIndex], true);
                    }
                } else {
                    this.allButtons(true);
                }
            },

            disableButtons: function (ActionsList) {

                if (ActionsList) {
                    for (var ActionIndex in ActionsList) {
                        this.button(ActionsList[ActionIndex], false);
                    }
                } else {
                    this.allButtons(false);
                }
            },

            allButtons: function (Active) {

                var Me = this;

                this.$Block.find('> a')
                    .each(function () {
                        Me.button($(this).attr('data-action'), Active);
                    });
            },

            button: function (Action, Active) {

                var $Button = this.$Block.find('[data-action="' + Action + '"]');
                if (Active) {
                    $Button
                        .removeClass('k-state-disabled')
                        .removeAttr('disabled');
                } else {
                    $Button
                        .addClass('k-state-disabled')
                        .attr('disabled', 'true');
                }
            },

            // -----------------------------------------------------------------------------------

            translateTexts: function () {
                var AP = this.AP;
                // Tool bar buttons
                this.$Block.find('a .k-toolbar-button-text[data-text-key]')
                    .each(function () {

                        var $this = $(this),
                            KeyText = $this.attr('data-text-key'),
                            Text = '';
                        KeyText && (Text = AP.View.Internationalize.translate(KeyText));

                        $this.html(Text);
                    });
            },

            destroy: function () {
                this.ButtonsExtender && this.ButtonsExtender.destroy && this.ButtonsExtender.destroy();
            }
        });

        return {
            name: 'ToolBar',
            widget: AgilePointWidgetsToolBar
        };
    }
);