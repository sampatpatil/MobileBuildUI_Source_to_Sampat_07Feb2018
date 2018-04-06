/*
 * jQuery remainingH
 * Version 1.0
 * http://srobbin.com/jquery-pageslide/
 *
 * jQuery Javascript plugin that automatically calculates the height dom elements content based on its parent and occupied previous all siblings size.
 *
 * author: Srinath Janakiraman
 * 
 * Copyright (c) 2014 Quadwave Consulting Pvt Ltd (quadwave.com)
 * Dual licensed under the MIT and GPL licenses.
*/
(function (global, factory) {
    // AMD
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], function (jQuery) {
            return factory(global, jQuery);
        });
        // CommonJS/Browserify
    } else if (typeof exports === 'object') {
        factory(global, require('jquery'));
        // Global
    } else {
        factory(global, global.jQuery);
    }
}(typeof window !== 'undefined' ? window : this, function (window, $) {
    // Convenience vars for accessing elements
    var $body = $('body'), key = 'remainingH', $window = $(window),
     nextTick = window.setImmediate || function (cb) {
         return window.setTimeout(cb, 0);
     },
   eachAsync = function (array, iterator, done) {
       var i = -1,
           total = array.length,
           next = function () {
               ++i;
               if (i >= total) {
                   done && done(); return;
               }
               iterator(array[i], next, i);
           };
       next();
   };


    var controller = function ($container, options) {


        var getOccupiedHeight = function ($elt) {
            var height = 0;
            $elt.prevAll().each(function () {
                height += $(this).outerHeight();
            });
            return height;
        },
        calcAll = function () {
            eachAsync($container.find(options.sel), function (elt, next) {
                calc($(elt), function () {
                    nextTick(next);
                });
            });
        },
        _timer = null,
         __onResize = function () {
             _timer && clearTimeout(_timer);
             _timer = setTimeout(calcAll, options.delay);
         },
         __onNodeInserted = function (e) {
             calc($(e.target));
         },
         start = function () {
             $window.on('resize', __onResize);
             $container.on('DOMNodeInserted', options.sel, __onNodeInserted);
         },
         stop = function () {
             $container.off('DOMNodeInserted', options.sel, __onNodeInserted);
             $window.off('resize', __onResize);
         },
         calc = function ($elt, callback) {
             if (!$elt.is(options.sel)) return;
             $elt.css({ height: 'auto' });
             nextTick(function () {
                 setTimeout(function () {
                     var totalHeight = $elt.parent().height();
                     if (!totalHeight) return;
                     $elt.height(totalHeight - getOccupiedHeight($elt));
                     callback && callback();
                 }, 500);

             });
         };

        __onResize();
        start();

        /*Exposed APIs*/
        this.calc = calc;
        this.start = start;
        this.stop = stop;
    };


    /*
     * Declaration 
     */
    $.fn.remainingH = function (options) {
        var opts = $.extend({}, $.fn.remainingH.defaults, options);
        var instance = new controller(this, opts);
        this.data(key, instance);
        return this;
    };

    /*
     * Default settings 
     */
    $.fn.remainingH.defaults = {
        delay: 250,
        sel: '.remaining-height' //jQuery selector to pick the elements which one height to be calculated based on its parent and previous siblings
    };

    return $;
}));
