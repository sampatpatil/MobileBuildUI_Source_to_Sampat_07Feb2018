
define(

    [
        'ap/modules/view/widget/basewidget',
        'lib/modules/utilities', 'lib/modules/freewall',
        'lib/modules/jquerynested'
    ],

    function (basewidget, utils, freewall) {

        'use strict';



        var AgilePointWidgetsMetroContent = basewidget.extend({
            _getDefaultConfig: function () {
                return {
                    nestedEnabled: false, useFreewall: false, adjustWidth: false, dragEnabled: true,
                    autoCenter: false, scrollToEnd: false, gutter: 20, selector: '> .Blocks > .Block',
                    minWidth: 205, minHeight: 205, animate: false,
                    customAnimation: true
                };
            },
            _wall: null,
            onInit: function (AgilePoint, BlockId) {
                var AP = AgilePoint;


                var me = this,
                    Block = AP.Model.getBlock(BlockId),
                    $Block = this.$Block,
                    config = this._config;


                $Block.addClass(Block.get('Class') || Block.get('Widget.Class') || '');

                if (config.dragEnabled) {
                    kendo.ui.progress($Block, true);
                    require(['lib/modules/dragdealer'], function (Dragdealer) {
                        kendo.ui.progress($Block, false);
                        Dragdealer && (me._dd = new Dragdealer(BlockId, { loose: true }));
                    });
                }

                this._resize();
                if (config.nestedEnabled) $Block.nested(config);
                else if (config.useFreewall) {
                    config.cellW = config.cellW || config.minWidth;
                    config.cellH = config.cellH || config.minHeight;
                    this._configureChildren();
                    this._wall = new freewall($Block);
                    this._wall.reset(config);
                    var me = this;
                    $Block.find(this._config.selector).css('opacity', 0);
                    this._adjustBlocks(true, function () { me._initOthers(); });
                    return;
                }
                this._initOthers();

            },
            _initOthers: function () {
                var config = this._config;
                config.customAnimation && this._animateBoxes();
                config.scrollToEnd && this._scollToEnd();
                this._center();
                this.$Block.css("border", "1px solid transparent;");
                //$Block.on('focus', config.selector, function () { this.scrollIntoView(); });
            },
            _configureChildren: function () {
                var config = this._config;
                this.$Block.find(config.selector).each(function () {
                    var $elt = $(this);
                    if (!$elt.is('.APWidget')) return;
                    var widget = $elt.data('APWidget');
                    var cfg = widget.getConfig();
                    $elt.css('width', (config.cellW * (cfg.Size.Width || 1)) + 'px');
                    $elt.css('height', (config.cellH * (cfg.Size.Height || 1)) + 'px');
                });
            }, _center: function () {
                this._config.autoCenter && this.$Block.css({ top: (($(window).height() - this.$Block.outerHeight()) / 2) + 'px' });
            }, _scollToEnd: function () {
                var dx = this.$Block.outerWidth() - $(window).width();
                if (dx < 0) return;
                this.$Block.scrollLeft(dx);
            }, _animateBoxes: function (reverse) {
                var $elts = this.$Block.find(this._config.selector), me = this;
                if (!reverse) $elts.css({ opacity: 0, transform: 'translate(500px) scale(0.5)' });
                var i = 0, onComplete = function () {
                    utils.invokeAsync(function () {
                        //$elts.css({ 'transform': '', '-webkit-transform': '', '-moz-transform': '', '-ms-transform': '', '-o-transform': '' });
                        this.AP.Controller.route('bind');
                        this.AP.View.refreshScrollables();
                    }, me, null, 300);
                };
                utils.loopAsync($elts, $.proxy(function (elt, next) {
                    ++i;
                    var opt = { duration: reverse ? 250 : 500 };
                    (i == $elts.length) && (opt.complete = onComplete);
                    this._animateBox($(elt), opt, reverse);
                    _.delay(next, 60);
                    //next();
                }, this));
            }, _animateBox: function ($e, opt, reverse) {
                //var fx = kendo.fx($e);
                //fx.slideInLeft().duration(1000).play();
                //$e.animate(anim, opt);
                //fx.zoom('in').duration(250).startValue(0.3).endValue(1.0).play();
                //fx.fadeIn().duration(1000).play();

                var fx = kendo.fx($e), anim = fx.fadeIn().add(fx.zoom().startValue(0).endValue(1)).add(fx.zoomIn()).add(fx.slideInLeft());
                anim.duration(opt.duration);
                (reverse ? anim.stop().reverse() : anim.stop().play()).then(opt.complete);

            },
            _resize: function () {
                if (!this._config.adjustWidth) return;
                var totalWidth = this.$Block.parent().outerWidth(), siblingsWidth = 0;
                this.$Block.siblings().each(function () { siblingsWidth += $(this).outerWidth(); });
                this.$Block.width(totalWidth - siblingsWidth);

            },
            _fitWall: function (offsetWidth) {
                var width = $(document).outerWidth() * 0.92;
                width -= (offsetWidth || 0);
                if (width < 600) width = 600;
                if (width > this._config.maxFitWidth) width = this._config.maxFitWidth;
                this._wall && this._wall.fitWidth(width);
            },
            onWindowResize: function () {
                this._center();
                //this._resize();
                //this._fitWall();
                this._adjustBlocks();
                basewidget.fn.onWindowResize.apply(this, arguments);
            },
            _adjustBlocks: function (immediate, callback) {
                this.AP.Utils.invokeAsync(function () {
                    this._fitWall(this.AP.View.isMainMenuOpen() ? this.AP.View.getMainMenuWidth() : 0);
                    callback && callback();
                }, this, null, immediate ? 1 : 500);
            },
            onMainMenuStateChanged: function (opened) {
                this._adjustBlocks();
            },
            destroy: function () {
                this._config.customAnimation && this._animateBoxes(true);
                this._dd && this._dd.destroy();
                basewidget.fn.destroy.apply(this, arguments);

            }
        });

        return { name: 'MetroContent', widget: AgilePointWidgetsMetroContent };
    }
);
