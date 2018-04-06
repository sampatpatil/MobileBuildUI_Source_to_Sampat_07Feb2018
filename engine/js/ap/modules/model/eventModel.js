define(['async'], function (async) {
    return {
        createEVM: function (APP) {


            var modelStore = new Object(),
                eventDrivers = new Object(),
                loadDNAIfReqd = function ($btn) {
                    var dna = $btn.data('loadDna');
                    dna && APP.Controller.route('action/loaddna', {
                        ClassPath: $btn.data('classPath') || 'Root',
                        Path: dna
                    });
                };


            /* Flatten event drivers to efficiently route the events*/
            _.each({
                'detail,click,button,iconClick': function (args) {
                    var deferred = $.Deferred();
                    //async.nextTick($.proxy(function () {
                    if (!args || !args.e) {
                        deferred.resolve(false);
                        return deferred.promise();
                    };
                    var me = this,
                        AP = me.App,
                        $elt = $(args.e.currentTarget),
                        result = true;
                    var action = $elt.data('action');
                    // Checking for each clik action can be executed or not based on current user's access rights    
                    // if the current user doesn't have the rights then it will displaying message otherwise continue its
                    // execution
                    var next = function (res) {
                        if (res.result) {

                            var loadLinkedDNA = function () {
                                loadDNAIfReqd($elt);
                            };
                            args.loadLinkedDNA = loadLinkedDNA;
                            result = action && me._execute(action, args);
                            //if a handler is not found for the requested action then see if any dna needs to be loaded.
                            if (!result) loadLinkedDNA();
                        } else {
                            AP.View.showAlertKey(res.message);
                            result = false;
                        }
                        deferred.resolve(res.result);
                    };
                    AP.Controller.AccessRightsHandler.canExecute($elt.data('accesscode'), next);
                    //}, this));
                    return deferred.promise();

                },
                stepchanging: function (args) {
                    var deferred = $.Deferred();
                    if (!args) {
                        deferred.resolve(false);
                        return deferred.promise();
                    }

                    var me = this,
                        AP = me.App,
                        result = me._execute('stepchanging', args);
                    if (!result) {
                        args.next();
                    }

                    deferred.resolve({ executed: result, skipNext: true });

                    return deferred.promise();
                },
                destroy: function (args) {
                    var deferred = $.Deferred();
                    //async.nextTick($.proxy(function () {
                    /*When widget is signalling destroy event, then silently remove from parent*/
                    this.parent && this.parent.removeItem(this);
                    //TODO: resolve using true value, once all modules are transformed to new events layer
                    deferred.resolve(false);
                    //}, this));
                    return deferred.promise();
                },
                toolbar: function (args) {
                    var deferred = $.Deferred();
                    //async.nextTick($.proxy(function () {
                    if (!args || !args.e) {
                        deferred.resolve(false);
                        return deferred.promise();
                    }
                    var me = this,
                        AP = me.App,
                        $elt = $(args.e.currentTarget),
                        result = true,
                        action = args.IsKeyEvent ? $elt.attr('data-' + args.Key + '-key-action') : $elt.data('action');

                    var next = function (res) {
                        if (res.result) {

                            var loadLinkedDNA = function () {
                                loadDNAIfReqd($elt);
                            };

                            args.loadLinkedDNA = loadLinkedDNA;
                            result = action && me._execute(action, args);
                            //if a handler is not found for the requested action then see if any dna needs to be loaded.
                            if (!result) loadLinkedDNA();
                        } else {
                            AP.View.showAlertKey(res.message);
                            result = false;
                        }
                        deferred.resolve(res.result);
                    };
                    // Checking for the toolbar action can be executed or not based on current user's access rights    
                    AP.Controller.AccessRightsHandler.canExecute($elt.data('accesscode'), next);
                    //}, this));
                    return deferred.promise();

                }
            }, function (v, k) {
                k.split(',').forEach(function (key) {
                    eventDrivers[key] = v;
                });
            });

            var eventModel = kendo.Class.extend({
                parent: null,
                App: APP,
                _children: null,
                widget: null,
                executeHandler: function (name, args) {
                    var deferred = $.Deferred(),
                    containAccessCodeAttribute = (args && args.e && $(args.e.currentTarget).is('[data-accesscode]'));
                    //async.nextTick($.proxy(function () {

                    if (name == 'init') name = 'widgetInit';
                    /*find the event driver and execute*/
                    var driver = eventDrivers[name],
                        me = this;
                    if (driver) {
                        driver.call(me, args).done(function (res) {
                            var res1;
                            //TODO : it is a quick fix for controlling event routing methodology based on access rights
                            args = $.extend(true, {}, args, { checkedAccessRights: res });

                            if (containAccessCodeAttribute && !args.checkedAccessRights) {
                                res1 = true;
                            }
                            else if (res && res.skipNext) {
                                res1 = res.executed;
                            }
                            else {
                                res1 = me._execute(name, args);
                            }
                            deferred.resolve(res1);
                        });
                    } else {

                        deferred.resolve(me._execute(name, args));
                    }
                    //}, me));
                    return deferred.promise();
                },
                _execute: function (name, args) {
                    if (this[name]) {
                        this[name](args);
                        return true
                    } else return false;

                },
                /* Called when its parent is ready and attached to it.
                 * And is called only once in a lifetime of relationship with its parent
                 * This method can be overridden by handlers to write logic when widget is ready.
                 */
                onAttached: function () {

                },
                _updateWidget: function (widget) {
                    this.widget = widget;
                    this.onWidgetUpdated();
                },
                /*
                 * This is called when the widget is initialized.
                 */
                init: function (widget) {
                    this._children = [];
                    this._updateWidget(widget);
                    this.onInit.apply(this, arguments);
                },
                onWidgetUpdated: function () {

                },
                onInit: function (Args) {

                },
                findChild: function (name, deepSearch) {
                    var child = _.findWhere(this._children, {
                        name: name
                    });
                    if (!child && deepSearch) _.find(this._children, function (chld) {
                        child = chld.findChild(name, deepSearch);
                        return child != null;
                    });

                    return child;
                },
                removeChild: function (name) {
                    var child = this.findChild(name);
                    this.removeItem(child);
                },
                removeItem: function (child) {
                    var idx = this._children.indexOf(child);
                    (idx > -1) && this._children.splice(idx, 1);
                    child.parent = null;
                },
                addChild: function (child) {
                    /*Proceed only if the element is present in the DOM*/
                    if (!$.contains(document, child.widget.$Block[0])) {
                        return false;
                    }

                    /*if the element is already a child of another element then remove from it.*/
                    if (child.parent != null) {
                        child.parent.removeChild(child);
                    }
                    this._children.push(child);
                    child.parent = this;
                    child.onAttached();
                },
                children: function () {
                    return this._children;
                },
                onError: function () {

                },
                destroy: function () {
                    this.parent && this.parent.removeChild(this.name);
                }
            });

            eventModel.add = function (name, evm) {
                if (!name || !evm) return;

                var me = this,
                    names = name.split(',');
                if (names.length > 1) {
                    /*Check if one event handler collection is mapped to multiple widget names,
                    If yes then register event handlers collection as many times
                    */
                    _.each(names, function (nam) {
                        me.add(nam, evm);
                    });
                    return;
                }
                evm.name = name;
                if (evm.init) {
                    evm.widgetInit = evm.init;
                    delete evm.init;
                }
                modelStore[name] = eventModel.extend(evm);
            };
            eventModel.create = function (name, widget) {
                var model = modelStore.hasOwnProperty(name) && new modelStore[name](widget);
                if (!model) {
                    model = new eventModel(widget);
                    model.name = name;
                }
                return model;
            };
            return eventModel;
        }
    };

});