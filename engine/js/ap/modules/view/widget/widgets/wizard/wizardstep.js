
define(
    [
        'kendo',// Kendo Libs
        'async',
        'ap/modules/view/widget/basewidget'
    ],

    function (K, async, baseWidget) {

        'use strict';

        var ActiveClassName = 'Active',
            resetTransform = function ($elt) {
                return $elt.css({
                    'transform': '',
                    '-webkit-transform': '',
                    '-moz-transform': '',
                    '-ms-transform': '',
                    '-o-transform': ''
                });
            },
            exWidget = baseWidget.extend({
                getHost: function () {
                    return this.$Block.parents('.APWizard').data('APWidget');
                },
                _getDefaultConfig: function () {
                    return { animationDuration: 250 };
                },
                onInit: function (AP, BlockId, block) {


                    var Me = this,
                        Block = block || AP.Model.getBlock(BlockId),
                        Config = this._config,
                        StepIndex = Block.get('Widget.Config.StepIndex') || (totalSteps > 0 ? totalSteps - 1 : 0);
                    Block.Widget.Config.StepIndex = StepIndex;
                    var $Block = this.$Block, $ParentBlock = $Block.closest('.APWizard');
                    this.$Block.addClass(Block.get('Widget.Class') || '');
                    if (StepIndex === 0) {
                        $Block.addClass(ActiveClassName);
                    }
                    var totalSteps = $ParentBlock.find('> .Blocks > .Step');
                    $Block
                        .attr('data-step-index', StepIndex)
                        .attr('data-step-name', Block.get('Widget.Name'));

                    this._clickHandler = $.proxy(function (e) {
                        var $btn = $(e.currentTarget);
                        if ($btn.attr('disabled'))
                            return false;

                        var targetStep = $btn.data('step-target');
                        var $step = $ParentBlock.find('.APWizardStep[data-step-name=' + targetStep + ']');
                        //var nextStepLoaded = false, stop = false;
                        var next = function (cont, stepname, parames) {
                            //nextStepLoaded = true;
                            //cont = cont || false;
                            //stop = !cont;
                            if (cont === false) return;
                            if (targetStep === '_end') {
                                /* Signal end wizard event to the parent wizard widget */
                                var hostingWindow = Me.getHostingWindow();
                                hostingWindow && hostingWindow.clear();
                            }
                            if (stepname && targetStep != stepname) {
                                $step = $ParentBlock.find('.APWizardStep[data-step-name=' + stepname + ']');
                            }
                            if ($Block != $step) {
                                var fx1 = kendo.fx($Block), fx2 = kendo.fx($step);

                                var fromIndex = $Block.data('stepIndex'), toIndex = $step.data('stepIndex');
                                var duration = Me._config.animationDuration;
                                if (fromIndex < toIndex) {
                                    fx1.slideInLeft()
                                        .add(fx2.fadeOut()).duration(duration)
                                        .stop().play()
                                        .then(function () {
                                            resetTransform($Block);
                                            async.nextTick(function () {
                                                $Block.removeClass(ActiveClassName);

                                                $step.css({ opacity: 0 });
                                                $step.addClass(ActiveClassName);


                                                fx2.slideInLeft()
                                                    .add(fx2.fadeIn()).duration(duration)
                                                    .stop()
                                                    .play()
                                                    .then(function () {
                                                        resetTransform($step);
                                                        AP.View.refreshScrollables();
                                                    });
                                            });
                                        });

                                } else {
                                    fx1.slideInRight()
                                        .add(fx2.fadeOut()).duration(duration)
                                        .stop()
                                        .play()
                                        .then(function () {
                                            resetTransform($Block);
                                            async.nextTick(function () {
                                                $Block.removeClass(ActiveClassName);

                                                $step.css({ opacity: 0 });
                                                $step.addClass(ActiveClassName);


                                                fx2.slideInRight()
                                                    .add(fx2.fadeIn()).duration(duration)
                                                    .stop()
                                                    .play()
                                                .then(function () {
                                                    resetTransform($step);
                                                    AP.View.refreshScrollables();
                                                });;
                                            });
                                        });
                                }
                            }
                        };
                        this.getHost().routeEvent('stepchanging', {
                            BlockId: BlockId,
                            currentStep: this,
                            step: { current: $Block, target: $step, targetName: targetStep },
                            e: e,
                            CanRepeat: true,
                            next: next
                        });
                        //if (!stop && !nextStepLoaded) next();


                        return false;
                    }, this);
                    if (Config.customModules) {
                        var clickTargets = [];
                        _.each(Config.customModules, function (id) {
                            var module = AP.View.Modules.get(id);
                            if (module)
                                module.setOptions({ eventHandlers: { click: Me._clickHandler } });
                        });
                        $Block.find(':not([data-custom-module-id]) .step-controller:not([data-skip-click=true])').on('click', this._clickHandler);
                    }
                    else {
                        $Block
                   .find('.step-controller')
                   .on('click', this._clickHandler);
                    }

                    this.translateTexts();
                },
                _clickHandler: null,
                onCustomModuleCreated: function (id, module) {
                    var AP = this.AP, Block = this.AP.Model.getBlock(this.BlockId), me = this;
                    if (!Block) return;
                    var Config = Block.get('Widget.Config');
                    _.each(Config.customModules, function (id) {
                        var module = AP.View.Modules.get(id);
                        if (module)
                            module.setOptions({
                                eventHandlers: {
                                    click: $.proxy(function () {
                                        this._clickHandler && this._clickHandler.apply(this, arguments);
                                    }, me)
                                }
                            });
                    });
                },
                button: function (TargetStep, Active) {
                    var $Button = this.$Block.find('.k-button[data-step-target="' + TargetStep + '"]');
                    if (Active) {
                        $Button
                        .removeClass('k-state-disabled')
                        .removeAttr('disabled');
                    } else {
                        $Button
                        .addClass('k-state-disabled')
                        .attr('disabled', 'true');
                    }
                }
            });

        return { name: 'WizardStep', widget: exWidget };
    }
)
