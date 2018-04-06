define(['ap/modules/view/widget/basewidget', 'underscore', 'async'],

    function (basewidget, _, async) {

        'use strict';
        var formWidget = basewidget.extend({
            _getDefaultConfig:function () {
                return {};
            },
            onInit: function (AP, BlockId) {

                var Me = this,
                    Block = AP.Model.getBlock(BlockId),
                    QueryId = Block.Widget.QueryId,
                    resetQ = Block.get('Widget.Config.resetQuery') || false,
                    Messages = Block.get('Widget.Config.Messages'),
                    FormTempl = Block.get('Widget.Config.FormTemplate'),
                    Buttons = Block.get('Widget.Config.Buttons');
                this.QueryId = QueryId;
                var ObservableData = AP.Config[resetQ ? 'resetQuery' : 'loadQuery'](QueryId);

                var FormContent = AP.View.Templates.renderTemplate(FormTempl || 'widget/forms/form', {
                    QueryId: QueryId,
                    _q: ObservableData
                });


                this.$Block.addClass(Block.get('Widget.Class') || '');
                this.$Block.prepend(FormContent);
                var keyupHandler = function (e) {
                    var $this = $(this),
                        Active = $this.attr('disabled') != 'disabled';
                    if (Active) {
                        e.preventDefault();
                        Me.routeEvent('keyup', {
                            BlockId: BlockId,
                            e: e,
                            CanRepeat: true
                        });
                    }
                }
                this.$Block.find('input[type=checkbox],input[type=radio]').on('click', $.proxy(function (e) {
                    this.routeEvent('boxClick', {
                        e: e,
                        BlockId: this.BlockId
                    });
                }, this));
                this.$Block.find('input[type=text],[type=email]').on('keyup', _.debounce(keyupHandler, 150));

                this.$Messages = this.$Block.find('.Messages');
                this.$Buttons = this.$Block.find('.Buttons');
                this.$Block.find('form').on('submit', function (e) {
                    e.preventDefault();
                    return false;
                });
                if (Messages) {
                    var MessageContent = AP.View.Templates.renderTemplate('widget/menus/message', {
                        QueryId: QueryId
                    });
                    this.$Messages.append(MessageContent);
                }

                var clickHandler = function (e) {
                    e.preventDefault();
                    var $button = $(e.currentTarget), routeButtonEvent = function (e) {
                        Me.routeEvent('button', {
                            BlockId: BlockId,
                            e: e,
                            CanRepeat: true
                        });
                    };
                    // skip the validation and continue routing to click event 
                    if ($button.is('[data-skip-validate]')) {
                        routeButtonEvent(e);
                        return false;
                    }
                    if (!$button.is('[disabled]') && Me.Validator.validate()) {// bug
                        routeButtonEvent(e);
                    }
                    return false;
                };

                var closeWindow = function (e) {
                    e.preventDefault();
                    var $window = Me.$Block.parent().closest('.APWindow');;
                    var widget = $window.data('APWidget');
                    if (widget == null) return;
                    widget.destroy();
                    return false;
                };

                if (Buttons) {
                    this.$Buttons.append(AP.View.Templates.renderTemplate('widget/toolbar/toolbar', {
                        BlockId: BlockId
                    }));
                    var CustomModule = Block.get('Widget.CustomModule');
                    if (CustomModule) {
                        var id = CustomModule.id;
                        Me.$Block.attr('data-custom-module-id', id);
                        require([CustomModule.path], function (module) {
                            CustomModule.instance = new module({
                                AP: AP,
                                BlockId: BlockId,
                                module: CustomModule,
                                $mb: Me.$Block,
                                eventHandlers: {
                                    click: clickHandler
                                }
                            });
                            AP.View.Modules.register(id, CustomModule.instance);
                            Me.$Block.parents('.APWidget').each(function () {
                                var wid = $(this).data('APWidget');
                                wid && wid.onCustomModuleCreated && wid.onCustomModuleCreated(id, CustomModule.instance);
                            });
                        });
                    }
                }
                // TODO sync with validator!
                this.$Buttons.find('.k-button')
                    .removeClass('k-state-disabled')
                    .removeAttr('disabled');
                this.$Buttons.on('click', '.k-button:not([data-skip-click=true])', clickHandler);
                this.$Buttons.on('click', '.k-button[data-close-window=true]', closeWindow);

                var dropDownChangeEventHandler = $.proxy(function (e) {
                    var $elt = $(e.currentTarget);
                    if (!$elt.is(':disabled')) {
                        var ddl = $elt.data('kendoDropDownList') || $elt.data('kendoComboBox');
                        if (!ddl) return;
                        var selectedValue = null,
                            selectedItem = ddl.dataItem(ddl.selectedIndex);
                        if (ddl.options.dataValueField && selectedItem) selectedValue = selectedItem[ddl.options.dataValueField];
                        Me.routeEvent('change', {
                            BlockId: BlockId,
                            e: e,
                            selectedItem: selectedItem,
                            selectedValue: selectedValue,
                            CanRepeat: true
                        });
                    }

                    return false;
                }, this);

                this.$Block.on('change select', '[data-role="dropdownlist"],[data-role="combobox"]', dropDownChangeEventHandler);
                this.$Block.on('click', '[data-action]', clickHandler);
                //this.$Block.on('select', '[data-role="dropdownlist"]', dropDownChangeEventHandler);

                if (this._config.rules) {
                    this.Validator = this.$Block.kendoValidator($.extend(true, {
                        validateOnBlur: true
                    }, AP.Config.Data.validationRules.buildRules(this._config.rules))).data("kendoValidator");
                }
                else {
                    this.Validator = this.$Block.kendoValidator({
                        validateOnBlur: true
                    }).data("kendoValidator");
                };

                this.translateTexts();

                AP.Controller.route('bind', {
                    CanRepeat: true, target: this.$Block
                });
            },

            // -----------------------------------------------------------------------------------

            select: function (e) {

                var Item = e.item,
                    $Item = $(Item),
                    OptionId = $Item.parent().attr('id').substring(0, $Item.parent().attr('id').indexOf('_'));

                var dataItem = e.sender.dataItem(e.item.index());
                var QueryId = $("#" + OptionId).attr('data-id');

                this.routeEvent('click', {
                    BlockId: BlockId,
                    e: e
                });
            },

            uploadFiles: function () {

                var me = this,
                    deferred = $.Deferred(),
                    results = {},
                uploadWidgets = _.map(this.$Block.find('[data-role="upload"]'), function (e) {
                    return kendo.widgetInstance($(e));
                });

                async.each(uploadWidgets, function (widget, done) {

                    var fieldName = widget.element.attr("name");

                    widget._showUploadButton();

                    results[fieldName] = {};

                    var result = results[fieldName];

                    var $btn = widget.wrapper.find('.k-button.k-upload-selected');
                    if (!$btn.length)
                    { result.completed = false; }



                    widget.one('upload', function (e) {
                        me.routeEvent(fieldName + 'Upload', { e: e });
                    });

                    widget.one('success', function (e) {
                        result.completed = true;
                        me.routeEvent(fieldName + 'Uploaded', { e: e, result: result });
                        done();
                    });

                    widget.one('error', function (e) {
                        result.error = e;
                        me.routeEvent(fieldName + 'UploadFailed', { e: e, result: result });
                        done();
                    });

                    $btn.trigger('click');
                    widget._hideUploadButton();


                }, function (e) {
                    e ? deferred.reject(e) : deferred.resolve(results);
                });

                return deferred.promise();
            },

            //// Removed as this would override destroy method in basewidget
            //destroy: function () {


            //}


        });
        return {
            name: 'Form',
            widget: formWidget
        };
    }
);