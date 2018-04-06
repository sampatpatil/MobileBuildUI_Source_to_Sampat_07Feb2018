/*
 * Session Manager
 * Version 1.1.1
 *
 * author: Srinath Janakiraman
 * 
 * Copyright (c) 2014 Quadwave Consulting Pvt Ltd (quadwave.com)
 * Dual licensed under the MIT and GPL licenses.
*/
(function (global, factory) {
    // AMD
    if (typeof define === 'function' && define.amd) {
        define(['jquery', 'cookies'], function (jQuery) {
            return factory(global, jQuery);
        });
        // CommonJS/Browserify
    } else if (typeof exports === 'object') {
        factory(global, require('jquery'), require('cookies'));
        // Global
    } else {
        factory(global, global.jQuery);
    }
}(typeof window !== 'undefined' ? window : this, function (window, $) {

    /**
    * Basic Event system implementation
    */
    var Event = function (name, context) {
        var store = [];
        this.dispatch = function () {
            var args = arguments;
            store.forEach(function (cb) {
                cb.apply(context, args);
            });
        };

        this.bind = function (cb) {
            store.push(cb);
        };

        this.unbind = function (cb) {
            if (cb) {
                var index = store.indexOf(cb);
                if (index > -1)
                    store.splice(index, 1);

            } else store = [];
        };

    },
    Class = function () {
    };
    Class.prototype = {
        init: function () {
            var me = this;
            me.events = me.events || [];
            me._events = {};
            me.events.forEach(function (eventName) {
                me._events[eventName] = new Event(eventName, me);
            });
        },
        _events: null,
        events: null,
        trigger: function (event, args) {
            this._events[event].dispatch(args);
        },
        bind: function (event, cb) {
            if (event instanceof Array) {
                event.forEach(function (evtName) {
                    cb[evtName] && this._events[evtName].bind(cb[evtName]);
                }, this);
            } else
                this._events[event].bind(cb);
        },
        unbind: function (event, cb) {
            if (event instanceof Array) {
                event.forEach(function (evtName) {
                    cb[evtName] && this._events[evtName].unbind(cb[evtName]);
                }, this);
            } else
                this._events[event].unbind(cb);
        }

    };

    Class.fn = Class.prototype;

    /*
     * Kendo Class extend implementation
     */
    Class.extend = function (proto) {
        var base = function () { },
            member,
            that = this,
            subclass = proto && proto.init ? proto.init : function () {
                that.apply(this, arguments);
            },
            fn;

        base.prototype = that.prototype;
        fn = subclass.fn = subclass.prototype = new base();

        for (member in proto) {
            if (proto[member] != null && proto[member].constructor === Object) {
                // Merge object members
                fn[member] = $.extend(true, {}, base.prototype[member], proto[member]);
            } else {
                fn[member] = proto[member];
            }
        }

        fn.constructor = subclass;
        subclass.extend = that.extend;

        return subclass;
    };


    /*
   * Base Authorization headers provider implementation
   */
    var BaseAuthHeaderProvider = Class.extend({
        _authHeader: null,
        _getAuthHeaderPromise: null,
        _getAuthHeader: function (async) {
            var me = this,
                state = 'rejected',
                now = new Date();

            if (me._getAuthHeaderPromise != null)
            { state = me._getAuthHeaderPromise.state(); }

            if (state == 'rejected' || (state == 'resolved' && (me._authHeader == null || (me._authHeader.expires && now.getTime() > me._authHeader.expires)))) {
                me._getAuthHeaderPromise = $.Deferred();
                this.read(async).done(function (data) {
                    me._authHeader = me.parse(data);
                    me._getAuthHeaderPromise.resolve(me._authHeader.auth);
                }).fail(me._getAuthHeaderPromise.fail);
            }
            return me._getAuthHeaderPromise.promise();
        },
        parse: function (data) {
            data.expires = Date.parse(data.expires);
            return data;
        },
        read: function (async) {
            return $.Deferred();
        },
        get: function () { return this._getAuthHeader(); },
        getSync: function () { return this._getAuthHeader(false); }
    });

    var remoteAuthHeaderProvider = BaseAuthHeaderProvider.extend({
        url: '/auth/getheaders',
        read: function (async) {
            return $.ajax({ async: async === undefined ? true : async, url: this.url, cache: false });
        }
    }),

    localAuthHeaderProvider = BaseAuthHeaderProvider.extend({
        sessionResolver: function () { return null; },
        read: function (async) {
            var deferred = $.Deferred();
            deferred.resolve({ auth: this.sessionResolver().getVars().auth });
            return deferred.promise();
        }
    });

    var normalizeDomain = function (hostname) {
        var splitted = hostname.split('.'),
            prefix = '.';

        if (splitted.length == 1)
        { return undefined; }

        //if the domain has the format as www.google.com where split by dot gives 3 items
        //we will skip www from the host name
        if (splitted.length == 3 && splitted[0].toLowerCase() == 'www')
        { splitted = splitted.slice(1); }

        //if split result contains more that 3 items then it is an ip address
        //no need of prepending dot in front.
        if (splitted.length > 3)
        { return splitted.join('.'); }

        return '.' + splitted.join('.');
    };

    /*
     * Abstract class for session providers
     */
    var sessionProvider = Class.extend({
        get: function () { },
        set: function () { }
    }),
    /**
     * An session provider based out of cookies as storage place to store the session detais
     */
    cookiesProvider = sessionProvider.extend({
        key: '',
        options: {
            key: 'Auth',
            path: '/',
            domain: normalizeDomain(window.location.hostname)
        },
        init: function (options) {
            sessionProvider.fn.init.apply(this, arguments);
            this.options = $.extend(true, {}, this.options, options);
            this.key = this.options.key;
        },
        get: function () {
            var val = $.cookie(this.key);
            return val && $.parseJSON(val);
        },
        set: function (val, options) {
            $.cookie(this.key, JSON.stringify(val || {}), $.extend(true, {}, options, this.options));
        },
        clear: function () {
            $.removeCookie(this.key, this.options);
        }
    }),
    /*Enumeration for different session states*/
    sessionStates = {
        /*Session is not enabled yet*/
        disabled: 0,
        /*Valid session is alive and has time range showing expiration warning*/
        normal: 1,
        /*Valid session is about to expire and warning message is currently shown*/
        warning: 2,
        /*The session is expired*/
        expired: 3
    },
    //Session Manager - To create and manage a client side session and to provide various events to the application
    sessionManager = Class.extend({
        _provider: null,
        _config: null,
        _timer: null,
        _warnTimer: null,
        _sin: null,
        isLoggedIn: false,
        events: ['warn', 'expired', 'cleared', 'stateChanged'],
        _state: sessionStates.disabled,
        _setState: function (state) {
            var oldState = this._state;
            this._state = state;
            (oldState != state) && this.trigger('stateChanged', {
                states: sessionStates,
                state: this._state,
                warningTicks: this._config.warningTimeoutWindow * 60
            });
        },
        //Gets the current state of session
        getState: function () {
            return this._state;
        },
        setConfig: function (config) {
            return this._config = config = $.extend(true, {}, this._config, config || {});
        },
        init: function (config) {
            this._config = {
                providerKey: 'AP_Auth',
                start: true,
                warningTimeoutWindow: 2,
                timeout: 2880,
                staySignedInFor: 14,
                authHeadersProvider: new remoteAuthHeaderProvider()
            };
            config = this.setConfig(config);
            Class.fn.init.call(this);
            this._provider = config.provider || new cookiesProvider({ key: this._config.providerKey });
            this.bind(this.events, this._config);
        },
        //Starts the session with given parameters or tries to start with already written parameters
        start: function (vars, staySignedIn) {
            if (!vars) {
                vars = this.getVars();

                if (!vars) return false;
                staySignedIn = vars.staySignedIn;
            }
            this._clearTimers();
            this._setVars(vars, staySignedIn);
            this._enable();
        },
        //Checks whether the session is valid or not
        isValid: function () {
            return this._provider.get() != null;
        },
        _setVars: function (vars, staySignedIn) {
            this._sin = staySignedIn;
            var expires = new Date();
            //if (staySignedIn) expires = this._config.staySignedInFor;
            //else {
            //    expires = new Date();
            //    expires.setTime(expires.getTime() + (this._config.timeout * 60 * 1000));
            //}

            expires.setDate(expires.getDate() + this._config.staySignedInFor);
            this._provider.set(vars, staySignedIn ? {
                expires: expires
            } : {});
            this.isLoggedIn = true;
        },
        //Gets the currently stored variables in session
        getVars: function () {
            var vars = this._provider.get();
            if (vars == null) {
                if (this._state == sessionStates.normal || this._state == sessionStates.warning) {
                    this.expired();
                }
            }
            return vars;
        },
        _enable: function () {
            this._setState(sessionStates.normal);
            var timeout = this._sin ? this._config.staySignedInFor * 24 * 60 : this._config.timeout;
            this._warnTimer = setTimeout($.proxy(this.warn, this), (timeout - this._config.warningTimeoutWindow) * 60000);
        },
        //Forces the session state to "warn" and raises "warn" event
        warn: function () {
            this._clearTimers();
            this.trigger('warn', this._provider.get());
            this._setState(sessionStates.warning);
            this._timer = setTimeout($.proxy(this.expired, this), this._config.warningTimeoutWindow * 60000);
        },
        //Forces the session state to "expired" and raises "expired" event
        expired: function () {
            this._clearTimers();
            this.trigger('expired');
            this._setState(sessionStates.expired);
            this.isLoggedIn = false;
        },
        //Clears the currently established session if any
        clear: function () {
            this._provider.clear();
            this._setState(sessionStates.disabled);
            this._clearTimers();
            this.isLoggedIn = false;
            this.trigger('cleared');
        },
        _clearTimers: function () {
            clearTimeout(this._timer);
            clearTimeout(this._warnTimer);
        },
        //Resets the session idle state but doesn't destroy it. 
        reset: function () {
            this._clearTimers();
            this._enable();
            this._setVars(this._provider.get(), this._sin);
        },
        useLocalAuthHeaderProvider: function () {
            var me = this;
            me._config.authHeadersProvider = new localAuthHeaderProvider();
            me._config.authHeadersProvider.sessionResolver = function () { return me; };
        },
        getAuthHeader: function () {
            return this._config.authHeadersProvider.get();
        },
        getAuthHeaderSync: function () {
            return this._config.authHeadersProvider.getSync();
        }
    });

    var exported = {
        states: sessionStates,
        manager: sessionManager,
        baseAuthHeaderProvider: BaseAuthHeaderProvider,
        remoteAuthHeaderProvider: remoteAuthHeaderProvider
    };

    window.sessionManagement = exported;

    return exported;

}));