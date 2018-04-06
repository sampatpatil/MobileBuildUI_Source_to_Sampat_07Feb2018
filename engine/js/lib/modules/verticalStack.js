define(['async', 'lib/modules/jquery.easing'], function (async) {
    (function ($) {
        var DATAKEY = 'verticalStackItem', ACTIVE_CLASS = 'active-item',
            control = function ($current, options) {
                this.options = function (o, extra) {
                    if (o) options = $.extend({}, extra || {}, $.fn.verticalStack.defaults, o || {});
                    else options = o;
                    return options;
                };
                // override the default options with user defined options
                var op, me = this;
                var itemSelector, $items, $slider, slider, containerHeight, containerWidth, calculations = [], startingTop = 0,
                    $activeItem, lastZeroPos = 0, $lastActiveElt, sliderTopAdj = 0;

                var refresh = function (opt) {
                    op = this.options(opt);
                    itemSelector = op.itemSelector;
                    $items = $current.find(itemSelector);
                    $slider = $current.find('.sliderex');
                    if ($items.length > 1) {
                        $slider.show();
                        slider = $slider.data('kendoSliderEx');
                        slider && slider.destroy();
                        slider = $slider.kendoSliderEx({
                            max: $items.length - 1, min: 0, width: '100%', largeStep: $items.length - 1, tooltip: {
                                transformer: function (e) {
                                    return { value: $items.eq(mapSliderValue(e.value)).attr('data-slider-tooltip') };
                                }
                            }
                        }).data('kendoSliderEx');
                        var $sli = slider && $current.find('.sliderex:first');
                        $sli && (sliderTopAdj = $sli.outerHeight() * 2.2);
                    } else $slider.hide();

                    //$items.css('top', startingTop + 'px');
                    $items.css('position', op.itemPositioning);
                    orderItems();
                    bindEventHandlers();
                    bringItemToFront($items[op.startingItem]());
                },
                getData = function ($item) {
                    return $item.data(DATAKEY);
                }, setData = function ($item, data) {
                    $item.data(DATAKEY, data);
                },
                animations = {
                    jump: function ($item, d, animate, next) {
                        //d.display && $item.show();
                        if (animate) {
                            var anim = { 'z-index': d.z, opacity: d.opacity, transform: ' scale(' + d.scale + ',' + d.scale + ')', top: d.top + 'px', left: d.left + 'px', right: d.right + 'px' }, opts = { queue: 'eff', easing: op.easing };

                            next && (opts.complete = next);

                            $item.animate({ top: ((d.z > $item.zIndex()) ? '-=' : '+=') + ($item.height() * 0.5), opacity: (d.z > $item.zIndex()) ? 1 : 0.5, 'z-index': d.z }, { queue: 'eff' })
                            .animate(anim, opts)
                            //utils.invokeAsync(function () { this.dequeue('eff'); }, $item, null, 800);
                            //translateY(' + d.top + 'px)
                        }
                        else {
                            $item.css('opacity', d.opacity);
                            $item.css('transform', ' scale(' + d.scale + ',' + d.scale + ')');//translateY(' + d.top + 'px)
                            $item.css('top', d.top + 'px');
                            $item.css('left', d.left + 'px');
                            $item.css('left', d.right + 'px');
                            $item.css('z-index', d.z);
                        }
                    },
                    flow: function ($item, d, animate, next) {
                        //d.display && $item.show();
                        if (animate) {
                            var anim = { 'z-index': d.z, opacity: d.opacity, transform: ' scale(' + d.scale + ',' + d.scale + ')', top: d.top + 'px', left: d.left + 'px', right: d.right + 'px' }, opts = { queue: 'eff', easing: op.easing };

                            next && (opts.complete = next);
                            (d.z < $item.zIndex()) && $item.animate({ top: '+=' + ($item.height() * 0.5), opacity: 0, 'z-index': d.z }, { queue: 'eff' });


                            $item.animate(anim, opts)
                            //utils.invokeAsync(function () { this.dequeue('eff'); }, $item, null, 800);
                            //translateY(' + d.top + 'px)
                        }
                        else {
                            $item.css('opacity', d.opacity);
                            $item.css('transform', ' scale(' + d.scale + ',' + d.scale + ')');//translateY(' + d.top + 'px)
                            $item.css('top', d.top + 'px');
                            $item.css('left', d.left + 'px');
                            $item.css('left', d.right + 'px');
                            $item.css('z-index', d.z);
                        }
                    }
                },
                orderItem = function ($item, d, animate, next) {
                    //d.display && $item.show();
                    animations[op.animation].apply(this, arguments);
                },
                calcTop = function (i, scale, ch, topAdjustment) {
                    var topv = ch * scale - ch;
                    topv /= 2; topv += topv * op.spacingFactor
                    /*if (i > 0)
                        topv -= topAdjustment;
                    else
                        topv += topAdjustment;
                    if (i > 0)
                        topv -= topAdjustment * scale;*/
                    return topv + topAdjustment + sliderTopAdj + sliderTopAdj * (1 - scale);
                },
                calcRelativeTopAdj = function (idx, pos, height, scale) {
                    //if (pos == 0) return 0;
                    var hei = height * idx;
                    return -hei - hei * (op.spacingFactor - scale);
                },
                calcScale = function (i) {
                    return 1 - i * op.scalingFactor;
                },
                recalculate = function () {
                    containerHeight = $current.outerHeight();
                    containerWidth = $current.outerWidth();
                    var leftAdjustment = (containerWidth - $items.outerWidth()) / 2, topAdjustment = (containerHeight - $items.outerHeight()) / 2;
                    calculations = [];
                    var lastTop;

                    $items.each(function (i) {
                        var $item = $(this), ridx = $items.length - i, itemData = { index: i, position: i, nextpos: i },
                            scale = calcScale(i), display = itemData.position < op.maxVisibleItems,
                        topv = lastTop = display ? op.itemPositioning == 'relative' ? calcRelativeTopAdj(i, i, $item.outerHeight(), scale) : calcTop(i, scale, containerHeight, topAdjustment) : lastTop;

                        setData($item, itemData);

                        var leftVal = (leftAdjustment + leftAdjustment * scale) * 0.5;
                        var d = {
                            display: display,
                            opacity: display ? 1 : 0,
                            scale: scale, z: ridx,
                            top: topv,
                            left: leftVal,
                            right: 0
                        };

                        calculations.push(d);
                        orderItem($item, d);
                    });
                    //me.calculations = calculations;
                    var $ai = $items.eq(0);
                    if ($activeItem != $ai) {
                        $activeItem && $activeItem.removeClass(ACTIVE_CLASS);
                        $activeItem = $ai;
                        $activeItem.addClass(ACTIVE_CLASS);
                        /*Trigger afterSwitch event once the items are ordered during initial rendering pass*/
                        afterSwitch({ active: $activeItem, lastactive: $lastActiveElt });
                    }
                },
                orderItems = function () {
                    $current.height('auto');
                    $current.height($items.outerHeight() + $items.outerHeight() / op.maxVisibleItems);
                    recalculate();

                    //if ($items.length > 1) {/*do recalcaculation only when we have more than one item*/
                    var ch = $current.outerHeight() + parseInt($activeItem.css('top'), 10);
                    $current.height(ch + ch * 0.01);
                    recalculate();
                    //} else {
                    if ($items.length == 1) {
                        var $item = $items.first();
                        $item.find('[data-carousel-action=maximize]').hide();
                        actions.maximize(null, null, $item);
                    }
                };


                var bringItemToFront = function ($item) {
                    if ($item == $activeItem || $item.length == 0 || ($item.length && $activeItem.length && $item[0] == $activeItem[0])) return;
                    $items.stop(true);
                    $lastActiveElt = $activeItem;
                    if (beforeSwitch({ active: $activeItem, next: $item, prevent: false })) return;

                    ($lastActiveElt) && (lastZeroPos = getData($lastActiveElt).position, $lastActiveElt.removeClass('maximized'), $lastActiveElt.removeClass(ACTIVE_CLASS));

                    $activeItem = $item;
                    orderData();
                    /*var data = getData($item), pos = 0, $itemsInFront = [];
                    while (pos < data.position) {
                        var $item = getItemBy('position', pos);
                        $itemsInFront.push($item);
                        pos++;
                    }
                    utils.loopAsync($itemsInFront, function ($item, next) {
                        $item.animate({ top: '+=' + $lastActiveElt.height() * 0.5 }, { complete: next })
                    }).done(normalizeDataAndItem);*/
                    normalizeDataAndItem();
                    //$lastActiveElt.animate({ top: '+=' + $lastActiveElt.height() * 0.5 }, { complete: function () { normalizeDataAndItem(); } });

                },
                getItemBy = function (target, pos) {
                    var $i;
                    $items.each(function () {
                        $i = $(this);
                        var data = getData($i);
                        if (data[target] == pos) { return false; }
                        $i = null;
                    });
                    return $i;
                },
                orderData = function () {
                    var activeItemData = getData($activeItem);
                    activeItemData.nextpos = 0;

                    var newpos = activeItemData.position;
                    if (newpos < $items.length) {
                        var rightLoop = $items.length - newpos, index = 1;
                        while (--rightLoop > 0) {
                            var nextData = getData(getItemBy('position', newpos + index));
                            nextData.nextpos = index++;
                        }
                        var idx = 0;
                        index = $items.length - newpos;
                        while (idx < newpos) {
                            var nextData = getData(getItemBy('position', idx++));
                            nextData.nextpos = index++;
                        }
                    }

                },
                beforeSwitch = function (e) {
                    e.type = 'beforeSwitch';
                    $current.trigger(e);
                    return e.prevent;
                },
                afterSwitch = function (e) {
                    e.type = 'afterSwitch';
                    $current.trigger(e);
                },
                mapSliderValue = function (index) {
                    return $items.length - 1 - index;
                },
                normalizeDataAndItem = function () {
                    var q = [];
                    var done = function () {
                        afterSwitch({ active: $activeItem, lastactive: $lastActiveElt });
                        var d = getData($activeItem), calc = d && calculations[d.position];
                        calc && ($activeItem.addClass(ACTIVE_CLASS), $activeItem.css('top', $activeItem.hasClass(op.maximizedClass) ? sliderTopAdj : calc.top), slider && slider.value(mapSliderValue($activeItem.index() - 1)));
                    };
                    $items.each(function () {
                        var $item = $(this), d = getData($item), calc = calculations[d.nextpos];
                        orderItem($item, calc, true, (d.nextpos == ($items.length - 1) && done));
                        q[d.position] = $item;
                        d.position = d.nextpos;
                    });
                    async.eachSeries(_.sortBy(q), function (item, next) {
                        $(item).dequeue('eff'); next();
                    });

                },
                clickHandler = function (e) {
                    e.preventDefault();
                    bringItemToFront($(e.currentTarget));
                    return false;
                },
                actions = {
                    ///Toggles the card b/w maximized and restored state
                    maximize: function (e, $btn, $item) {
                        $item.toggleClass(op.maximizedClass);
                        var d = getData($item), calc = d && calculations[d.position];
                        calc && $item.hasClass(ACTIVE_CLASS) && $item.css('top', $item.hasClass(op.maximizedClass) ? sliderTopAdj : calc.top);
                    }
                },
                debouncedBIF = _.debounce(bringItemToFront, 500),
                sliderChange = _.debounce(function (e) {
                    var $item = $items.eq(mapSliderValue(e.value));
                    $activeItem && $activeItem.hasClass(op.maximizedClass) ? (actions.maximize(e, null, $activeItem), debouncedBIF($item)) : bringItemToFront($item);
                }, 250),
                raiseClick = function (e) {
                    $current.trigger({ type: 'buttonClick', e: e });
                }, bindEventHandlers = function () {
                    $items.off('click');
                    $items.on('click', clickHandler);
                    $items.on('click', '.k-button', function (e) {
                        var $btn = $(e.currentTarget);
                        var action = $btn.attr('data-carousel-action'), $item = $btn.closest('.CarouselItem');
                        actions.hasOwnProperty(action) ? actions[action](e, $btn, $item) : raiseClick(e);
                    });
                    slider && (slider.unbind('change', sliderChange), slider.bind('change', sliderChange));
                };

                this.refresh = refresh;
                this.refresh(options);
            };

        $.fn.verticalStack = function (o) {
            this.data('verticalStack', new control(this, o));
            return this;
        };

        $.fn.verticalStack.defaults = {
            itemSelector: 'li',
            startingItem: 'last',
            maximizeWhenOnlyItem: true,
            spacingFactor: 1.2,
            scalingFactor: 0.1,
            maxVisibleItems: 3,
            itemPositioning: 'absolute',
            easing: 'easeInOutCubic',
            animation: 'jump',
            maximizedClass: 'maximized'
        };

        $.fn.zIndex = function () {
            var zi = this.css('z-index');
            try {
                return kendo.parseInt(zi);
            } catch (e) {
                return -1;
            }
        };
    })(jQuery);
});
