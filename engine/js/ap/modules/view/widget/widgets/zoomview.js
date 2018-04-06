
define(

    [
        'kendo',
        'ap/modules/view/widget/basewidgetwithtabstrip',
        'lib/modules/utilities',
        'lib/modules/AnimationFrame'
    ],

function (k, basewidgetwithtabstrip, utils, AnimationFrame) {

    'use strict';

    var AREASELECTED = 'areaselected',
        AREASELECTING = 'areaselecting',
        AREASELECTIONCHANGED = 'areselectionchanged',
        DATABINDING = "dataBinding",
        DATABOUND = "dataBound",
        CHANGE = "change",
        ZOOMCHANGE = 'zoomchange',
        CONTENTCHANGE = 'contentchange',
        CONFIGCHANGE = 'configchange',
        SHAPECLICK = 'shapeClick';
    var animStepper = function (anim) {
        var start = anim.from, end = anim.to, step = anim.step, prop = anim.property, _dir = 1;
        var _delta = start, backNForth = function () {
            if (_delta > end) { _dir = -1; return (_delta = end + (_dir * step)); }
            else if (_delta < start) { _dir = 1; return (_delta = start + (_dir * step)); }
            return _delta += (_dir * step);
        };
        var steppers = {
            Opacity: backNForth,
            Angle: function () {
                if (_delta >= end) return _delta = start;
                return _delta += step;
            }
        };
        this.next = function () {
            return steppers[anim.property]();
        };
    };



    var imageFromUrl = function (src, callback) {
        var img = new Image();
        img.onload = $.proxy(function () { callback && callback(this); }, img);
        img.src = src;
    };

    var domElement = kendo.Class.extend({
        id: '', name: '',
        element: null, options: null,
        init: function (element, options) {
            this.options = options = options || {};
            var me = this;
            this.setElement(element);
            _.each(options, function (val, key) {
                me.set(key, val);
            });
            this.id = options.id || '';
            this.name = options.name;
        },
        set: function (prop, val) {
            var pr = prop, method = 'css';
            switch (prop) {
                case 'strokeWidth':
                    pr = 'border-width';
                    break;
                case 'fill':
                    pr = 'background-color';
                    if (val == 'transparent') val = 'rgba(0,0,0,0)'
                    break;
                case 'stroke':
                    pr = 'border-color';
                    break;
                case 'cssClass':
                case 'name':
                case 'id':
                    method = 'attr';
                    break;
            }
            this.options[prop] = val;
            this.element[method](pr, val);
        },
        setElement: function (elt) {
            var $elt = $(elt);
            this.element && this.element.replaceWith($elt);
            this.element = $elt;
        },
        addClass: function (cssClass) {
            this.element && this.element.addClass(cssClass);
        },
        removeClass: function (cssClass) {
            this.element && this.element.removeClass(cssClass);
        },
        remove: function () {
            this.element && this.element.remove();
        }
    });

    /*var domGroup = domElement.extend({
        elements: null,
        init: function (elements, options) {
            this.options = options;
            this.element = $('<div></div>');
            this.setElements(elements);
        },
        setElements: function (elts) {
            var me = this;
            me.element.html('');
            _.each(elts, function (elt) {
                me.element.append(elt);
            });
        }
    });*/

    var fabricAnimator = function (canvas) {
        this._canvas = canvas;
        this._frame = new AnimationFrame();
    };

    var domUtil = domElement.extend({
        items: null,
        init: function (elt, options) {
            this.items = [];
            domElement.fn.init.apply(this, arguments);
        },
        add: function (elt) {
            this.items.push(elt);
            this.element.append(elt.element);
        },
        findByName: function (nm) {
            return _.find(this.items, function (elt) {
                return elt.name == nm;
            });
        },
        removeByName: function (name) {
            var elt = this.findByName(name);
            this.remove(elt);
        },
        remove: function (elt) {
            elt && (elt.remove(), this.items.splice(this.items.indexOf(elt), 1));
        },
        clear: function () {
            this.element.empty();
            this.items = [];
        }
    });

    fabricAnimator.prototype = {
        _animations: [], _stopped: true, _isRunning: false, _steppers: new Object, _canvas: null, _frame: null,
        getAnimation: function (groupName, animationName) {
            return _.findWhere(this._animations, { name: animationName, groupName: groupName });
        },
        clearAnimations: function () {
            this._animations = [];
            this._steppers = [];
        },
        addAnimation: function (groupName, animationName, animation) {
            var exist = this.getAnimation(groupName, animationName);
            if (!exist)
                this._animations.push({ name: animationName, groupName: groupName, dna: animation });
            else exist.dna = animation;
            if (!this._steppers[groupName]) this._steppers[groupName] = {};
            this._steppers[groupName][animationName] = new animStepper(animation.options);
            !this._isRunning && !this._stopped && this._requestNextFrame();
        },
        removeAnimation: function (groupName, animationName) {
            var idx = this._animations.indexOf(this.getAnimation.apply(this, arguments));
            if (idx > -1) {
                this._animations.splice(idx, 1);
                delete this._steppers[groupName][animationName];
            }
        },
        _animLoop: function () {
            var me = this;
            _.each(this._animations, function (anim) {
                var dna = anim.dna;
                dna.obj['set' + dna.options.property](me._steppers[anim.groupName][anim.name].next());
            });
            //this._canvas && this._canvas.renderAll();
            this._requestNextFrame();
        },
        start: function () {
            if (this._stopped) {
                this._stopped = false;
                this._isRunning = true;
                this._animations.length && this._requestNextFrame();
            }
        },
        stop: function () {
            this._stopped = true; this._isRunning = true;
        },
        _requestNextFrame: function () { !this._stopped && this._frame.request($.proxy(this._animLoop, this), this._obj); }
    };


    var Widget = kendo.ui.Widget, imageViewerWidget = Widget.extend({
        $slider: null,
        _v: null, _orig_val: null, _val: 50, _canvas: null, tagId: '', gifs: [], _animator: null,
        _selection: [], _highlightedData: [], highlightedAreas: [], _src: null, _imgElt: null,
        _lastRequestedFrame: null, _framerate: 60, _animFrame: null, _animRunning: false,
        destroy: function () {
            this.stopAnimation();
            this.stopAnimator(true);
            Widget.fn.destroy.apply(this, arguments);
        },
        startAnimation: function () {
            this.stopAnimation();
            this._animRunning = true;
            this._animFrame = new AnimationFrame(this._framerate);
            this._onAnimTick();
        },
        stopAnimator: function (clearAnimations) {
            if (this._animator) {
                clearAnimations && this._animator.clearAnimations();
                this._animator.stop();
            }
        },
        startAnimator: function () {
            //!this._animator && (this._animator = new fabricAnimator(this._canvas));
            //this._animator.start();
        },
        stopAnimation: function () {
            this._animRunning = false;
            this._animFrame && this._animFrame.cancel(this._lastRequestedFrame)
        },
        _scheduleNextFrame: function () {
            this._animRunning && this._animFrame && (this._lastRequestedFrame = this._animFrame.request($.proxy(function (time) {
                var me = this; //utils.invokeAsync(me._onAnimTick, me, me, me._framerate);
                this._onAnimTick();
            }, this)));
        },
        _onAnimTick: function () {
            this._scheduleNextFrame();
            var me = this;
            /*me.gifs && _.each(me.gifs, function (aa) {
                //var src = aa._originalElement.src;
                //aa._originalElement.src = '';
                me._canvas.remove(aa);
                //aa._originalElement.src = src;
                me._canvas.add(aa);
            });*/
            //this._canvas && this._animRunning && this._canvas.renderAll();
        },
        init: function (element, options) {
            var me = this;
            Widget.fn.init.call(me, element, options);
            me.setConfig();
            me.element.on('click', '.selectable', $.proxy(this._onClick, this));
            this.$slider = this.element.siblings('.ToolBar').find('.k-slider');
            this.$slider.hide();
        },
        _updateValue: function (val) {
            if (this._val == val) return; this._val = val; this.trigger(ZOOMCHANGE, val); this.trigger(CHANGE, { zoom: val });
        },
        _onZoom: function (e, val) {
            this._updateValue(val * 100);
            this.stopAnimator();
        },
        _onAfterZoom: function (e, val) {
            this._updateValue(val);
            this.startAnimator();
        },
        _create: function () {
            var me = this, zUH = $.proxy(function (e, pz, val) {
                if (e.type != 'panzoomzoom') return;
                var mval = val * 100;
                if (this._val == mval) return; this._val = mval; this.trigger(ZOOMCHANGE, mval);
            }, me);
            if (me.highlightedAreas)
                _.each(me.highlightedAreas, function (ha) {
                    me._canvas.add(ha);
                });

            me._v = me._canvas.element;
            var cfg = $.extend({ contain: false }, {
                //src: src,
                strictMode: false,
                onStart: $.proxy(this._onPanStart, this),
                onPan: $.proxy(this._onPanDelta, this),
                onEnd: $.proxy(this._onPanEnd, this),
                onClick: $.proxy(this._onClick, this),
                //onMouseMove: $.proxy(this._onMouseMove, this),
                onZoom: zUH,
                onChange: zUH,
                onFinishLoad: $.proxy(function () {
                    this.setZoom(this._val);
                }, me)
            }, me.config);
            this.setConfig(cfg, true);
            me._v.panzoom(me.config).parent().on('mousewheel.focal', function (e) {
                e.preventDefault();
                e.stopPropagation();
                var delta = e.delta || e.originalEvent.wheelDelta || e.originalEvent.detail * -40;
                var zoomOut = delta ? delta < 0 : e.originalEvent.deltaY > 0;
                me._canvas.element.panzoom('zoom', zoomOut, {
                    increment: 0.1,
                    focal: e
                });
            });
            if (!me._orig_val && _.isNumber(me.config.zoom)) me._orig_val = me.config.zoom;
            if (_.isNumber(me._orig_val)) me.setZoom(me._orig_val);
            this.trigger('imageReady');
            this.element.trigger('imageReady');
        },
        _inProgress: function () {
            this.element.find('.Progress').show();
        },
        setSrc: function (src, forceRender) {
            var me = this;
            if (!$.contains(document, me.element[0])) return;
            if (!me._v || !me._v.panzoom('__pz__') || me._src != src) {
                me._src = src;

                if (me.config && me.config.isCanvas) {
                    var tagId = me.tagId = kendo.guid(), tagSelector = '#' + tagId, canvas = me._canvas;
                    me.config.tagSelector = tagSelector;
                    if (me._canvas && (forceRender || !src)) {
                        //me._canvas.clear();
                        me._canvas.clear();
                        this.$slider.hide();
                        me._canvas = null;
                        me._imgElt = null;
                        try {
                            me.element.panzoom('destroy');
                        } catch (e) { }
                    }
                    if (!src) return;

                    if (!me._canvas) {
                        var canvasElt = me.element.html('<div id="' + tagId + '" class="imageholder full-height"><div class="image" style="padding:24px"></div></div>').find('div.image');
                        canvas = me._canvas = new domUtil(canvasElt);
                        me.stopAnimator(true);
                        //me._animator = new fabricAnimator(canvas);
                        //$(tagSelector).siblings('.upper-canvas').attr('id', tagId + "_upper");
                        //me.config.tagSelector += "_upper";
                        me._attachAreaEvents(canvas);
                    }
                    /*var configureImg = function (img) {
                        img.lockMovementX = true;
                        img.lockMovementY = true;
                        img.selectable = false;
                        return img;
                    };*/
                    if (me.config.base64) {
                        var imgElt = new Image();
                        imgElt.src = src;
                        canvas.set('width', imgElt.width);
                        canvas.set('height', imgElt.height);
                        me.config.width = me.config.width || imgElt.width;
                        me.config.height = me.config.height || imgElt.height;
                        //if (src.indexOf('.gif') > -1) me.startAnimation();
                        if (!me._imgElt) {
                            var img = new domElement(imgElt, { top: 0, left: 0 });
                            canvas.add(img);
                            //me._attachAreaEvents(img);
                            me._imgElt = img;
                            this.$slider.show();
                        }
                        else me._imgElt.setElement(imgElt);
                        //canvas.setBackgroundImage(src);
                        //canvas.renderAll(true);
                        this._create(src, forceRender);
                    } else   //TODO: update this part to enable loading image from url
                        imageFromUrl(src, $.proxy(function (img) {
                            this._canvas.add(new domElement(img, { top: 0, left: 0 }));
                            this._create(src, forceRender);
                            //this._attachAreaEvents(img);
                        }, me));
                } else
                    me._create(src, forceRender);
            }
            //me.element.attr('src', src);
        },
        _doHitTest: function (coords) {
            var me = this;
            if (!me._canvas) return;
            var canvas = me._canvas, objs = canvas.items;
            if (objs.length < 2) return;
            var elts = objs.slice(1), del = 0, x = Math.abs(coords.x + del), y = Math.abs(coords.y + del);
            return _.find(elts, function (elt) {
                var opt = elt.options;
                return opt.selectable
                    && y >= Math.abs(opt.top - opt.height * 0.5)
                    && y <= Math.abs(opt.top + opt.height * 0.5)
                    && x >= Math.abs(opt.left - opt.width * 0.5)
                    && x <= Math.abs(opt.left + opt.width * 0.5);
            });
        },
        _onPanStart: function (e) {
            this.stopAnimator();
        },
        _onPanDelta: function (e) {

        },
        _onPanEnd: function (e) {
            //this.startAnimator();
        },
        _onMappedAreaHover: function (e) {
            this.trigger('areahoverin', e);
        },
        _onHoverIn: function (e) {
            $(e.currentTarget).css('pointer', 'pointer');
        },
        _onHoverOut: function () {
            $(e.currentTarget).css('pointer', 'move');
        },
        _onMouseMove: function (e, coords) {
            //emulate the hover based on mouse move over the canvas for shapes within canvas



        },
        _onClick: function (e, coords) {
            var me = this, $elt = $(e.currentTarget), selected, canvas = me._canvas;
            canvas && (selected = me._canvas.findByName($elt.attr('name')));

            if (!selected) return;
            var data = this.getDataItem(selected);
            me.trigger(SHAPECLICK, { item: selected });            
            data && data.selectOptions && me._toggleSelection(selected);
        },
        getDataItem: function (obj) {
            return _.findWhere(this._highlightedData, { key: obj.name });
        },
        getDataItemByKey: function (key) {
            return _.findWhere(this._highlightedData, { key: key });
        },
        getSelection: function () {
            return this._selection || [];
        },
        getSelectionData: function () {
            var me = this;
            return _.map(me.getSelection(), $.proxy(me.getDataItem, me));
        },
        bringToView: function (key) {
            var data = this.getDataItemByKey(key);
            if (data == null) return;
            var $lce = $(this._canvas.lowerCanvasEl);
            var currLeft = kendo.parseFloat($lce.css('left').replace('px', '')), currTop = kendo.parseFloat($lce.css('top').replace('px', '')), containerWidth = $lce.parent().width(), containerHeight = $lce.parent().height();
            var factor = this._val / 100;
            var shapeWidth = data.coords.right - data.coords.left, shapeHeight = data.coords.bottom - data.coords.top;
            var toLeft = containerWidth + shapeWidth;
            $lce.animate({ left: toLeft * factor + currLeft });
        },
        clearSelection: function (silent) {
            var me = this;
            _.each(me._selection, function (o) { me._selectObj(o, false, silent); return; });
            me._selection = [];
        },
        _selectObj: function (obj, select, silent) {
            var me = this, canvas = me._canvas;
            if (!canvas) return;
            if (obj) {
                var stroke, data = this.getDataItem(obj);

                var args = { selected: select, dataItem: data };
                silent || this.trigger(AREASELECTING, args);
                var changeDetected = false;
                if (args.selected) {
                    if (!me.config.multiselect && me._selection.length > 0)
                        _.each(me._selection, function (o) { me._selectObj(o, false); return; });
                    me._selection.push(obj);
                    stroke = (data.selectOptions && data.selectOptions.color) || me.config.selectedColor;
                    me._onMappedAreaSelected(args, obj);
                    changeDetected = true;
                    data.selectOptions.cssClass && obj.addClass(data.selectOptions.cssClass);
                } else {
                    var idx = me._selection.indexOf(obj);
                    if (idx > -1) {
                        changeDetected = true;
                        me._selection.splice(idx, 1);
                    }
                    this._deleteSelAnimation(obj.name);
                    stroke = 'transparent';
                    data.selectOptions.cssClass && obj.removeClass(data.selectOptions.cssClass);
                }
                silent || changeDetected && me.trigger(AREASELECTIONCHANGED, { selection: me.getSelection(), selectedItems: me.getSelectionData() });
                obj.set('stroke', stroke);
                //me._canvas.renderAll();
            }
        },
        _toggleSelection: function (selected) {
            if (!selected || !selected.element) return;
            var selLayer = selected.element;
            this._selectObj(selected, selected.options.stroke === 'transparent');
        },
        _createAnimation: function (groupName, obj, animation) {
            //animation && this._animator.addAnimation(groupName, obj.name, { obj: obj, options: animation });
        },
        _deleteSelAnimation: function (name) {
            //this._animator.removeAnimation('selected', name);
        },
        _refereshSelectionAnim: function (data, obj) {
            if (data.selectOptions && data.selectOptions.animation) {
                this._deleteSelAnimation(obj.name);
                this._createAnimation('selected', obj, data.selectOptions.animation);
            }
        },
        _onMappedAreaSelected: function (e, obj) {
            this._refereshSelectionAnim(e.dataItem, obj);
            this.trigger(AREASELECTED, e);
        },
        selectArea: function (callback) {
            var me = this;
            me._canvas && callback && _.each(this._canvas.items.slice(1), function (area) {
                var val = callback.apply(me, [area, me.getDataItem(area)]);
                _.isBoolean(val) && me._selectObj(area, val);
            });
        },
        selectAreaByKey: function (key) {
            this._selectObj(this._canvas.findByName(key), true);
        },
        _attachAreaEvents: function (area) {
            /*area && area.on('mouse:move', $.proxy(this._onMappedAreaHover, this));
            area && area.on('object:selected', $.proxy(this._onMappedAreaSelect, this));*/
        },
        clearHighlightedAreas: function () {
            var me = this, canvas = me._canvas;
            me.stopAnimation();
            me.stopAnimator(true);
            me.clearSelection(true);
            canvas && me.highlightedAreas && _.each(me.highlightedAreas, function (a) {
                canvas.remove(a);
                //a.remove();
            });
            me.gifs && _.each(me.gifs, function (a) {
                canvas.remove(a);
                //a.remove();
            });
        },
        highlightAreas: function (data, keys) {
            var me = this, canvas = me._canvas, hias = [], gifs = [];
            keys = keys || [];
            if (!canvas) return;
            this.clearHighlightedAreas();
            var defaultShapeOptions = { position: 'absolute', stroke: 'red', fill: 'transparent', strokeWidth: 5, selectedColor: me.config.selectedColor }, scheduleAnimStart = false;
            me._highlightedData = [];
            _.each(data, function (ad) {
                var li = ad.toJSON ? ad.toJSON() : ad, d = li.coords, shape = li.shape || 'Rect';
                li.uid = kendo.guid();
                li.options = $.extend(true, { hasControls: false }, li.options || {});
                me._highlightedData.push(li);
                if (d && (ad.hasOwnProperty(me.config.mapKey) && keys.indexOf(ad[me.config.mapKey]) > -1 || me.config.strictMode === false)) {
                    var configureArea = function (area, data) {
                        area.element.data('areaData', data);
                        if (!area.options.selectable) {
                            //data.options && me._createAnimation('active', area, data.options.animation);
                            area.element.removeClass('selectable');
                            return area;
                        }
                        //var selectableRect = new domElement('<div></div>',
                        //    $.extend(true, {
                        //        name: area.name, 'class': 'selectable',
                        //        left: area.left, top: area.top, width: area.width, height: area.height,
                        //        strokeWidth: 2, stroke: 'transparent', fill: 'transparent', selectable: true
                        //    }, data.selectOptions));
                        //var grp = new domGroup([area, selectableRect], { name: area.name });
                        area.selectOptions = $.extend(true, area.options, {
                            strokeWidth: 2, stroke: 'transparent', fill: 'transparent'
                        }, data.selectOptions);
                        area.set('border-style', 'dashed');
                        area.options.selectable = true;
                        area.element.addClass('selectable hoverable');
                        //selectableRect.left = area.left += (selectableRect.strokeWidth * 0.25);
                        /*selectableRect.set('top', area.top -= (selectableRect.strokeWidth * 0.5));
                        selectableRect.set('height', area.height += selectableRect.strokeWidth * 2);
                        selectableRect.set('width', area.width += selectableRect.strokeWidth * 2);
                        data.options && me._createAnimation('active', grp, data.options.animation);*/
                        return area;
                    };
                    var elt, shapeOptions = $.extend(true, {}, defaultShapeOptions, { width: d.right - d.left, height: d.bottom - d.top }, d, li.options || {});
                    switch (shape) {
                        case 'Image':
                            shapeOptions = li.options = $.extend(true, {}, defaultShapeOptions, d, li.options || {});
                            delete shapeOptions.stroke;
                            delete shapeOptions.fill;
                            //imageFromUrl(li.src, function (img) {
                            var img = new Image();
                            img.src = li.src;
                            elt = new domElement(img, shapeOptions);
                            elt.name += shape;
                            //});
                            break;
                        case 'Text':
                            var elt = new domElement($('<span>' + li.text + '</span>'), shapeOptions)
                            elt.name += shape;
                            break;
                        default:
                            elt = new domElement($('<div></div>'), shapeOptions);
                            break;
                    }

                    elt && ((elt = configureArea(elt, li)), hias.push(elt), me._canvas.add(elt));
                }
            });
            this.highlightedAreas = hias;
            this.gifs = gifs;
            this.setSrc(me._src, false);
            this.startAnimator();
            //scheduleAnimStart && me.startAnimation();


            //canvas.renderAll(true);
            /*if (me._v) {
                var uiv = me._v.data('uiIviewer');
                if (uiv) uiv.destroy();
            }*/
        },
        setConfig: function (val, silent) {
            var me = this;
            var value = val;
            if (val && val.toJSON) value = val.toJSON();
            me.config = $.extend({ multiselect: true, selectedColor: 'green' }, value);
            (me.config.zoom_min) && (me.config.minScale = (me.config.zoom_min / 100));
            (me.config.zoom_max) && (me.config.maxScale = (me.config.zoom_max / 100));
            me.config.transition = me.config.transition == null ? me.config.zoom_animation : me.config.transition;
            if (!silent) this.trigger(CHANGE, { field: 'config' });
        },
        setZoom: function (val) {
            var me = this;
            me._val = val;
            if (!me._v || !me._v.panzoom('__pz__')) { return; }

            me._v.panzoom('zoom', me._val / 100, { duration: 100 });
        },
        options: {
            name: 'imageviewer'
        },
        // events are used by other widgets / developers - API for other purposes
        // these events support MVVM bound items in the template. for loose coupling with MVVM.
        events: [
            // call before mutating DOM.
            // mvvm will traverse DOM, unbind any bound elements or widgets
            DATABINDING,
            // call after mutating DOM
            // traverses DOM and binds ALL THE THINGS
            DATABOUND,
            ZOOMCHANGE, CONFIGCHANGE,
            AREASELECTED, AREASELECTING,
            'imageReady',
            'click'
        ]
    });

    kendo.ui.plugin(imageViewerWidget);

    var AgilePointWidgetsZoomView = basewidgetwithtabstrip.extend({
        _highlightData: null, _mapped: false, $defaultContent: null,
        _getDefaultConfig: function () {
            return { autoRead: true, ToolBar: [], defaultContent: 'APZoomView.defaultContent' };
        },
        onInit: function (AP, BlockId, block) {

            var Me = this, Block = block || AP.Model.getBlock(BlockId);


            var slider = this._config.slider || {};
            var $ImageViewer = this.$Block.html(AP.View.Templates.renderTemplate('widget/zoomview/zoomview', { BlockId: BlockId, Block: Block, AP: AP })).find('.ImageViewer');
            this.$defaultContent = $ImageViewer.find('.DefaultContent').html(AP.View.Internationalize.translate(this._config.defaultContent));
            if (this._config.ToolBar) {
                $ImageViewer.append(AP.View.Templates.renderTemplate('widget/toolbar/toolbarwrapper', { BlockId: BlockId }));
                this.ToolBarBlockId = 'ToolBar_' + BlockId;
                var $ToolBarBlock = $('#' + this.ToolBarBlockId);
                if (slider && slider.enabled)
                    $ToolBarBlock.append(AP.View.Templates.renderTemplate(slider.template || 'widget/zoomview/zoomslider', { BlockId: BlockId, Block: Block, AP: AP }));

                //this.$Block.addClass('ToolBar');

                $ToolBarBlock.data('APWidget', AP.View.Widget.widgetize(this.ToolBarBlockId,
                                                                       'APToolBar',
                                                                        Block));
                if (this._config.fieldsTemplate)
                    $ToolBarBlock.append(AP.View.Templates.renderTemplate(this._config.fieldsTemplate, { BlockId: BlockId, Block: Block, AP: AP }));
                this.ToolBar = $ToolBarBlock.data('APWidget');
                $.each(this._config.ToolBar, function (i, t) {
                    if (t.isEnabled)
                    { Me.ToolBar.activateButtons([t.action]); }
                });

                $ToolBarBlock
                .find('.Fields input[type=checkbox],input[type=radio]')
                .on('click', function (e) {
                    var $elt = $(e.currentTarget);
                    if (!$elt.is(':disabled')) {
                        Me.routeEvent($elt.attr('type') + 'Click', {
                            e: e,
                            CanRepeat: true
                        });
                    }
                });
                $ToolBarBlock
                .find('a.k-button')
                .on('click', function (e) {

                    if (!$(e.currentTarget).is(':disabled')) {

                        Me.routeEvent('click', {
                            e: e,
                            CanRepeat: true
                        });
                    }
                    return false;
                });

            }

            $ImageViewer.append(AP.View.Templates.renderTemplate('widget/zoomview/zoomviewcontent', { BlockId: BlockId, Block: Block, AP: AP }));
            if (this.QueryId) {
                this.buildDatasource(null, this._config.autoRead);
            }
            //this.BlockModel = Block;
            //this.BlockModel = $.extend({}, { translate: AP.View.Internationalize.translate }, Block, { AP: null });
            /*var interval = setInterval(function () {
                clearInterval(interval);*/
            AP.Controller.route('bind', { CanRepeat: true });
            /*}, Config.DelayInit || 0);*/
            //this.BlockModel.AP = AP;

            this.$Block.on('imageReady', '.Display', function () {
                _.delay($.proxy(Me._rePositionImage, Me), 1000);
            });

           
            this.translateTexts();
        },       
        highlight: function (data, selectedKeyValues) {
            //var $imageMaps = this.$Block.find('.ImageMaps');
            //var mapId = this.BlockId + '_img_map';
            //$imageMaps.html(this.AP.View.Templates.renderTemplate('widget/zoomview/map', { AP: this.AP, BlockId: this.BlockId, MapId: mapId, areas: data }));
            //var $img = this.$Block.find('.ImageViewer img');
            //$img.attr('usemap', '#' + mapId);

            var widget = this.getInitiatedTarget();
            if (widget) widget.highlightAreas(data, selectedKeyValues);
        },
        requeststart: function (e) {
            this.showProgress();
            this.$defaultContent.hide();
        },
        getInitiatedTarget: function () {
            var $tartget = this.$Block.find('.Display.iviewer-target');
            return $tartget.data('kendoimageviewer');
        },
        cleanupInitiatedTarget: function () {
            var $tartget = this.$Block.find('.Display.iviewer-target');
            var wid = $tartget.data('kendoimageviewer');
            wid && (wid.unbind(), wid.destroy());
            //$tartget.data('kendoimageviewer', null);
        },
        getSelection: function () {
            var widget = this.getInitiatedTarget();
            return widget && widget.getSelection();
        },
        getSelectionData: function () {
            var widget = this.getInitiatedTarget();
            return widget && widget.getSelectionData();
        },
        selectAreaByKey: function (key) {
            var widget = this.getInitiatedTarget();
            widget && widget.selectAreaByKey(key);
        },
        clearSelection: function (silent) {
            var widget = this.getInitiatedTarget();
            widget && widget.clearSelection(silent);
        },
        onDataSourceReady: function (d, r) {
            this.requestend(r);
        },
        requestend: function (e) {
            this.hideProgress();
            this.$Block.trigger('requestend', e);
            var data = this._response = e.response;
            var d = this._data, h = [];
            try { d = this._dataSource.options.schema.parse(e.response, this.AP); }
            catch (ex) { d = data; }
            finally {
                this._data = d;
                this.setSrc(d);
                var widget = this.getInitiatedTarget();
                if (widget) {
                    widget.bind(ZOOMCHANGE, $.proxy(this.onZoomChange, this));
                    widget.bind(SHAPECLICK, $.proxy(this._onShapeClick, this));
                    widget.bind(AREASELECTING, $.proxy(this.onAreaSelecting, this));
                    widget.bind(AREASELECTED, $.proxy(this.onAreaSelected, this));
                    widget.bind(AREASELECTIONCHANGED, $.proxy(this.onAreaSelectionChanged, this));
                }
                this.highlight(h);
            }
            this.routeEvent('requestend', { e: e });
        },
        setSrc: function (d) {
            var block = this.AP.Model.getBlock(this.BlockId);
            if (block) {
                if (!d || !d.data)
                    this.$defaultContent.show();
                else
                    this.$defaultContent.hide();

                block.set('Widget.Data', d);
                utils.invokeAsync($.proxy(function () { this._rePositionImage(); }, this));
            }
        },
        _onShapeClick: function (e) {
            if (!e.item) return;
            this.routeEvent('shapeClick', {
                BlockId: this.BlockId,
                e :e,
                selectedItem : e.item,
                imageViewer : e.sender,
                CanRepeat: true
            });
        },
        onZoomChange: function () {
            var $img = this.$Block.find('.ImageViewer img');
            //if ($img.length > 0)
            //    $img.mapster('resize', $img.width(), $img.height());
        },
        onAreaSelecting: function (e) {
            this.routeEvent(AREASELECTING, { e: e });
        },
        onAreaSelected: function (e) {
            this.routeEvent(AREASELECTED, { e: e });
        },
        onAreaSelectionChanged: function (e) {
            this.routeEvent(AREASELECTIONCHANGED, { e: e });
        },
        setZoom: function (val) {
            var widget = this.getInitiatedTarget();
            widget && widget.setZoom(val);
        },
        refresh: function () {
            this._dataSource && this._dataSource.refresh && this._dataSource.refresh();

            this.routeEvent('refresh', {
                BlockId: this.BlockId,
                CanRepeat: true
            });
        },
        _rePositionImage: function () {
            var $viewer = this.$Block.find('[data-role="imageviewer"]'), $image = $viewer.find('.image'),
            $imageholder = $viewer.find('.imageholder');

            $imageholder.height($viewer.outerHeight() * 0.98);
            var viewer = $image.panzoom('__pz__'), block = this.AP.Model.getBlock(this.BlockId);
            if (!viewer || !block) return;
            viewer.resetDimensions && viewer.resetDimensions();
            var val = block.get('Widget.ZoomLevel.value');
            block.set('Widget.ZoomLevel.value', val + 1);
            block.set('Widget.ZoomLevel.value', val);
        },        
        onTabActivated: function () {
            this._rePositionImage();
        },
        onKendoWindowResize: function () {
            this._rePositionImage();
        },
        onMainMenuStateChanged: function () {
            this.AP.Utils.invokeAsync(this._rePositionImage, this, null, 300);
        },
        onWindowResize: function () {
            this._rePositionImage();
        },
        destroy: function () {
            this.cleanupInitiatedTarget();
            basewidgetwithtabstrip.fn.destroy.apply(this, arguments);
        }
    });

    return { name: 'ZoomView', widget: AgilePointWidgetsZoomView };
});
