
define(

    [
        'ap/modules/controller/controller',				// Routing & Event Controller
        'ap/modules/model/model',						// Kendo model management
        'ap/modules/view/view',							// View render engine
        'async'
    ],

    function (
        Controller,
        Model,
        View,
        async
    ) {

        'use strict';

        var AgilePoint = function (Config, utils) {
            var me = this;
            //Exporting the parts of application
            define('app', function () { return me; });
            me.onError = $.proxy(function (e) {
                return this.Config.DEBUG;
            }, this);
            window.onerror = $.proxy(this.onError, this);
            // AP globals
            me.Delay = null; // for intervals & timeouts 

            me.Config = Config;
            //export app configuration as module, thus dependent module could request as a dependency
            define('config', function () { return me.Config; });

            me.Utils = new utils(me);
            //export utils as a module
            define('utils', function () { return me.Utils; });


            me.Controller = new Controller(me);
            //exports controller as a module
            define('controller', function () { return me.Controller; });

            me.Model = new Model(me);
            me.Model.start();
            //export model as a module
            define('model', function () { return me.Model; });

            me.View = new View(me);
            //export view as module
            define('view', function () { return me.View; });

            me.View.start();


            //Allow any asyncronous operation to perforn before intialization
            me.Config.setApp(me, $.proxy(function () {
                this.Controller.init(); // Start app	
                this.Config.Data.asyncRender && this.View.renderFromBuffer();
            }, me));

            async.nextTick(function () {
                //me.View.start();
                //An temporary shim for action until it is resolved
                //So if any module trying to interact with action center even before it is loaded wouldn't fail.
                me.ActionCenter = (function () {
                    var center, buffer = { addNotification: [], addError: [], addAction: [], addBulkAction: [] },
                        drainBuffer = function () {
                            _.each(buffer, function (v, k) {
                                _.each(buffer[k], function (item) {
                                    center[k](item);
                                });
                            });
                        },
                    getCenter = function () {
                        (!center) && (me.ActionCenter = center = me.View.$ViewRoot.find('.ActionCenter').data('APWidget'));
                        center && drainBuffer();
                        return center;
                    };
                    if (!getCenter())
                    {
                        var methods = {
                            addNotification: function (msg) {
                                if (!getCenter()) buffer.addNotification.push(msg);
                            },
                            addError: function (msg) {
                                if (!getCenter()) buffer.addError.push(msg);
                            },
                            addAction: function (msg) {
                                if (!getCenter()) buffer.addAction.push(msg);
                            },
                            addBulkAction: function (msg) {
                                if (!getCenter()) buffer.addBulkAction.push(msg);
                            }
                        };
                        return methods;
                    }
                    return center;
                }).call(this);
                me.Config.Data.asyncRender && me.View.renderFromBuffer();
            });

        };

        return AgilePoint;
    }
);

