/*
 * jQuery css3menu
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
	var $body = $('body'), key = 'css3menu', $window = $(window),
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


	var menuOpenTimerKey = 'menu-open-timer',
     menuCloseTimerKey = 'menu-close-timer',
        controller = function ($context, options) {

        	var $menu = $context.find(options.menuSel),
                $btn = $context.find(options.openCloseBtnSel),
                delayExec = function (callback, delay) {
                	var timer = setTimeout(callback)
                },
                getOpenTimerVal = function ($menuItem) {
                	return $menuItem.data(menuOpenTimerKey);
                },
                getCloseTimerVal = function ($menuItem) {
                	return $menuItem.data(menuCloseTimerKey);
                },
                clearOpenTimer = function ($menuItem) {
                	clearTimeout(getOpenTimerVal($menuItem));
                	$menuItem.data(menuOpenTimerKey, -1);
                },
                clearCloseTimer = function ($menuItem) {
                	clearTimeout(getCloseTimerVal($menuItem));
                	$menuItem.data(menuCloseTimerKey, -1);
                },
                schedule = function ($menuItem, key, callback, delay) {
                	var timer = $menuItem.data(key);
                	if (timer == undefined || timer == -1)
                		$menuItem.data(key, setTimeout(callback, delay));
                },
                open = function ($menuItem) {                    
                	return $menuItem.addClass(options.activeMenuItemClass);
                },
                close = function ($menuItem) {
                	return $menuItem.removeClass(options.activeMenuItemClass);
                },
                scheduleOpen = function ($menuItem) {
                	clearCloseTimer($menuItem);
                	schedule($menuItem, menuOpenTimerKey, function () {
                		open($menuItem);
                	}, options.hoverDelay);
                },
                scheduleClose = function ($menuItem) {
                	clearOpenTimer($menuItem);
                	schedule($menuItem, menuCloseTimerKey, function () {
                		close($menuItem);
                	}, options.hoverDelay);
                },
                toggleExpandCollapse = function (e) {

                	e.preventDefault();
                	$menu.is('.' + options.expandedClass) ? collapse() : expand();
                },               
                bindHandlers = function () {
                	$btn.on('click', toggleExpandCollapse);
                	$menu
                       .on('click', options.itemSel, function (e) {
                       	var $elt = $(e.currentTarget);
                       	//e.preventDefault($elt);
                       	clearOpenTimer($elt);
                       	clearCloseTimer($elt);
                       	open($elt);
                       	options.select && options.select({ item: $elt });
                       });

                	$menu.find(options.itemSel)
                       .on('mouseenter', itemHoverIn)
                       .on('mouseleave', itemHoverOut);
                },
                expand = function () {
                	$menu.removeClass(options.collapsedClass);
                	$menu.addClass(options.expandedClass);
                	$btn.addClass('open');
                	$btn.removeClass('close');
                	options.expanded && options.expanded();
                },
                collapse = function () {
                	$menu.removeClass(options.expandedClass);
                	$menu.addClass(options.collapsedClass);
                	$btn.addClass('close');
                	$btn.removeClass('open');
                	options.collapsed && options.collapsed();
                },
                itemHoverIn = function (e) {
                	var $elt = $(e.currentTarget);
                	scheduleOpen($elt);
                },
                 itemHoverOut = function (e) {
                 	var $elt = $(e.currentTarget);
                 	scheduleClose($elt);
                 };

        	bindHandlers();
        	/*Exposed APIs*/
        	this.expand = expand;
        	this.collapse = collapse;
        };


	/*
     * Declaration 
     */
	$.fn.css3menu = function (options) {
		var opts = $.extend({}, $.fn.css3menu.defaults, options);
		var instance = new controller(this, opts);
		this.data(key, instance);
		return this;
	};

	/*
     * Default settings 
     */
	$.fn.css3menu.defaults = {	    
		activeMenuItemClass: 'menu-item-active',
		openCloseBtnSel: '.openclose-button',
		menuSel: '.menu',
		itemSel: '.menu-item',
		expandedClass: 'expanded',
		collapsedClass: 'collapsed',
		hoverDelay: 500 //How much time the code should wait before expanding or collapsing the menuitem when hovered.
	};

	return $;
}));
