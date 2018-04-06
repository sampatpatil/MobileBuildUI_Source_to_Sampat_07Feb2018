
define(

    [
        'jquery',
        'xmlParser',
        'underscore',			// just magic underscore
        'lib/modules/infuser',
        'lib/modules/jquery.remainingH'
    ],

    function (

        ) {
        ///Gets the the ticks of time
        Date.prototype.getTicks = function () {
            return ((this.getTime() * 10000) + 621355968000000000);
        };
        var trim = function (str) {
            return (str || '').replace(/^\s+|\s+$/g, '');
        }, startsWith = function (str, prefix) {
            str = (str || '');
            prefix = (prefix || '');
            return str.indexOf(prefix) === 0;
        }, endsWith = function (str, suffix) {
            str = (str || '');
            suffix = (suffix || '');
            return str.indexOf(suffix, str.length - suffix.length) !== -1;
        };
        var methodHooker = function (pre, post, withContext) {
            this.method = function () {
                var args = pre && pre.apply(withContext || this, arguments) || arguments;
                return post.apply(withContext || this, args);
            };
        }, promiser = function (keys) {
            var promises, iterator, promiseStore = {}, saveCB = function (cb) {
                promiseStore[this.key] = cb;
                return [cb];
            }, postHook = function (cb) {
                return promises;
            };
            if (_.isArray(keys)) {
                promises = {};
                iterator = function (key) {
                    promises[key] = _.hook(saveCB, postHook, { key: key });
                };
            } else {
                promises = keys;
                iterator = function (method, key) {
                    promises[key] = _.hook(saveCB, _.hook(method, postHook), { key: key });
                };
            }
            _.each(keys, iterator);
            this.promises = promises;
            this.promiseStore = promiseStore;
            this.completePromise = function (key, args, context) {
                promiseStore.hasOwnProperty(key) && (promiseStore[key].apply(context || this, args), delete promiseStore[key]);
            };
        };

        /**
         * Load jQuery mixins
         */
        $.fn.animateAuto = function (prop, speed, callback) {
            var elem, height, width;
            return this.each(function (i, el) {
                el = jQuery(el), elem = el.clone().css({ "height": "auto", "width": "auto" }).appendTo("body");
                height = elem.css("height"),
                width = elem.css("width"),
                elem.remove();

                if (prop === "height")
                    el.animate({ "height": height }, speed, callback);
                else if (prop === "width")
                    el.animate({ "width": width }, speed, callback);
                else if (prop === "both")
                    el.animate({ "width": width, "height": height }, speed, callback);
            });
        };

        $.fn.namespaces = function () {
            var child = $(this).children()[0], namespaceValue = [];
            var attrs = child && child.attributes;
            attrs && _.each(attrs, function (x) {
                (x.name.indexOf('xmlns') != -1) && namespaceValue.push({ name: x.name.split(':')[1], value: x.value });

            });
            return namespaceValue || null;
        };

        /* To fix drag and drop issue in chrome and opera browser. */
        if (window.chrome && window.chrome.runtime) {
            $.event.special && $.event.special.pointerleave && ($.event.special.pointerleave.handle = function (e) {
                e.stopPropagation();
                return false;
            });
        };

        /**
         * Load underscore mixins
         */

        var mixins = {
            startsWith: startsWith,
            endsWith: endsWith,
            trim: trim,
            promisify: function (promises) {
                return new promiser(promises);
            },
            hook: function (pre, post, withContext) {
                return (new methodHooker(pre, post, withContext)).method;
            },
            sum: function (array, field) {
                return _.reduce(array, function (a, b) {
                    if (_.isNumber(a) && _.isObject(b)) return a + (b[field] || 0);
                    if (_.isNumber(a) && _.isNumber(b)) return a + b;
                    if (field && a.hasOwnProperty(field) && b.hasOwnProperty(field)) return a[field] + b[field];
                    return a;
                });
            },
            average: function (array, field) {
                return _.sum(array, field) / array.length;
            }
        };
        _.mixin(mixins);
        return mixins;

    }							// Lib modules loaded
);

