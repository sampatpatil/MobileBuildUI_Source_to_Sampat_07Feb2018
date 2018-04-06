define(['kendo',
        'lib/modules/encoders',
        'lib/modules/utilities',
        'lib/modules/sessionManager', 'async'], function (K, encoders, utils, sessionManagement, async) {
            var states = new Object,
                _isWarningVisible = false,
                AP_AUTH = 'AP_Auth',
                base64 = encoders.base64;
            var ajaxRequestsManager = function (AP, query, config) {
                this.AP = AP;
                this._q = query;
                this._config = config;
                this._interval = this._config.interval || 10;
            };
            ajaxRequestsManager.prototype = {
                AP: null,
                _q: null,
                _config: null,
                _stopped: false,
                _interval: 10,
                _clearhold: null,
                _requests: [],
                _loopTimer: function () {
                    this._clearhold = utils.invokeAsync(this._tick, this, null, this._interval * 1000);
                    return this;
                },
                _tick: function () {
                    if (this._stopped) return;
                    this.AP.Config.ensureLoggedIn().done($.proxy(function () {
                        this._startRequest();
                        this._loopTimer();
                    }, this));
                },
                _startRequest: function () {
                    var callbacks = this._config.callbacks;
                    var xhr = this.AP.Config._ajaxRequest(this._q, {
                        success: $.proxy(function () {
                            if (callbacks.success && callbacks.success.apply(this, arguments)) {
                                this.stop();
                            }
                        }, this),
                        error: $.proxy(function () {
                            callbacks.error && callbacks.error.apply(this, arguments);
                        }, this)
                    })
                        .then($.proxy(function (a, b, jqXHr) {
                            this._requests.splice(this._requests.indexOf(jqXHr), 1);
                        }, this), $.proxy(function (jqXHr) {
                            this._requests.splice(this._requests.indexOf(jqXHr), 1);
                        }, this));
                },
                start: function (startImmediately) {
                    return this[(startImmediately && '_tick') || '_loopTimer']();
                },
                stop: function (abortPending) {
                    this._clearhold && clearTimeout(this._clearhold);
                    this._stopped = true;
                    if (abortPending) {
                        _.each(this._requests, function (xhr) {
                            xhr && xhr.abort();
                        });
                    }
                }
            };
            var path = {
                join: function (left, right) {
                    return left + ((left.charAt(left.length - 1) != '/') ? '/' : '') + right;

                }
            };
            var createDataSrcFromQuery = function (queryId, options, generatorArgs) {
                var AP = this.AP,
                    vm = this.AP.Config.getQuery(queryId, generatorArgs);
                //vm.generateQuery && vm.generateQuery(options);
                if (!this._session.isValid()) {
                    this._session.expired();
                    return {};
                }
                var headers = this._session.getVars();

                var Url = path.join(vm.usePortalUrl ? this.Data.PortalUrl : this.Data.APIUrl, vm.QueryMethod) + '?appID=' + this.Data.appname + '&locale=' + this.Data.locale + '&Date=' + new Date(),
                    DataSourceBase = {
                        // type: "odata",
                        transport: {
                            read: {
                                url: Url,
                                headers: $.extend(true, {}, this._getDefaultHeaders(), {
                                    "Authorization": headers.auth
                                }),
                                dataType: "json",
                                cache: false,
                                contentType: "application/json",
                                type: vm.QueryType
                            }
                        },
                        schema: {
                            data: function (response) {
                                if (response.Response == undefined) return [];
                                var Data = response.Response.Data || [];
                                return Data;
                            },
                            errors: function (response) {

                            },
                            total: function (response) {
                                if (response.Response == undefined) return 0;
                                var Data = response.Response.Data || [];
                                return Data.length;
                            }
                        }
                    };

                return $.extend(true, {}, DataSourceBase, vm.DataSource, options);
            };


            var sessionStates = sessionManagement.states,
             //Session Manager - To create and manage a client side session and to provide various events to the application
            sessionManager = sessionManagement.manager;
            var baseConfig = kendo.Class.extend({
                id: '',
                Queries: [],
                CustomWidgets: [],
                base64: encoders.base64,
                Data: {
                    asyncRender: false,
                    loginHandler: 'menu/signin',
                    hostPath: '',
                    isStandalone: true,
                    templatesPath: 'engine/templates/',
                    scrollColor: '#006ab5',
                    requiredFieldMarker: '*'
                },
                Controller: {},
                Dialog: {},
                ACL: {},
                _session: null,
                init: function (Overrides) {
                    this.id = kendo.guid();
                    states[this.id] = new Object();
                    this._onPageInteracted = $.proxy(this._onPageInteracted, this);
                    $(document).on('click', this._onPageInteracted);
                    $(document).on('change', this._onPageInteracted);
                    // Add extra config set from index.html
                    $.extend(true, this.Data, Overrides);
                    this._session = new sessionManager($.extend(true, {},
                        this.Data.Session, {
                            cleared: $.proxy(this._sessionCleared, this),
                            stateChanged: $.proxy(this._sessionStateChanged, this)
                        }));
                    this.onInit.apply(this, arguments);
                },
                isLoginHandler: function (path) {
                    return this.Data.loginHandler == path;
                },
                onInit: function () {
                    var query = this.Queries[oqid];
                    return _.isFunction(query) ? query(this.AP) : query;
                },
                getBreadCrumbsPath: function (path) {
                    return path;
                },
                setConfig: function (configData) {
                    var model = kendo.observable(this.Data);
                    _.each(configData, function (val, key) {
                        model.set(key, val);
                    });
                    this.Data = model.toJSON();
                    return this.updateConfigData();
                },
                setApp: function (AP, complete) {
                    this.AP = AP, me = this;
                    if (this.CustomWidgets) {
                        var cw = this.CustomWidgets;
                        require(['ap/modules/view/widget/widget'], function (Widget) {
                            require(cw, function () {
                                _.each(arguments, function (meta) {
                                    Widget.Repository.addWidgetDef(meta);
                                });
                                complete && complete();
                                me.onAppReady();
                            });
                        });
                    } else complete && complete();
                },
                updateConfigData: function () {
                    var deferred = $.Deferred();
                    deferred.resolve(true);
                    return deferred.promise();
                },
                onAppReady: function () {
                    this.registerHandlers(this.Controller.Events);
                },
                registerHandlers: function (handlers) {
                    var me = this;
                    _.each(handlers, function (v, k) {
                        me.AP.Model.EventTree.add(k, v);
                    });
                },
                getQuery: function (oqid, args) {
                    var vm = this.Queries[oqid];
                    return _.isFunction(vm) ? vm(this.AP, args || {}) : vm;
                },
                getOriginalQueryId: function (qid) {
                    var sel = '_extends_',
                        fidx, oqid = qid;
                    if (qid) {
                        fidx = qid.indexOf(sel);
                        (fidx > -1) && (oqid = qid.substr(fidx + sel.length));
                    }
                    return oqid;
                },
                loadQuery: function (qid, createNew) {
                    var sel = '_extends_',
                        oqid = this.getOriginalQueryId(qid);
                    var AP = this.AP,
                        vmPath = 'State.Query.' + qid;
                    try {
                        if (!AP.Model.ViewModel.get(vmPath))
                            AP.Model.ViewModel.set(vmPath, createNew ? this.getQuery(oqid) : this.loadQuery(oqid, AP.Model.ViewModel.get('State.Query.' + oqid) == null));

                        var vm = AP.Model.ViewModel.get(vmPath);
                        vm && (oqid != qid) && vm.set('Id', qid);
                    }
                    catch (e) {
                        if (AP.Config.Data.DEBUG) console.error(e);
                    }
                    return vm;
                },
                getExtendedQueryId: function (subQid, baseQid) {
                    return subQid + '_extends_' + baseQid;
                },
                resetQuery: function (qid, reuseExisting) {
                    var AP = this.AP,
                        vmPath = 'State.Query.' + qid,
                        vm = AP.Model.ViewModel.get(vmPath);
                    vm && vm.unbind();
                    AP.Model.ViewModel.set(vmPath, reuseExisting ? this.loadQuery(this.getOriginalQueryId(qid)) : this.getQuery(qid));
                    return AP.Model.ViewModel.get(vmPath);
                },
                createDataSourceFromQuery: function (queryId, options, generatorArgs) {

                    return {
                        id: queryId,
                        getter: $.proxy(function (arg, qid) {
                            return createDataSrcFromQuery.call(this, qid, arg, generatorArgs);
                        }, this, options),
                        toJSON: function () {
                            var json = kendo.data.ObservableObject.fn.toJSON.call(this);
                            json.getter = this.getter;
                            return json;
                        }
                    };
                },
                // kendo datasource base structure for this app
                DataSource: function (Querydata, Data, callback) {

                    if (!this._session.isValid()) {
                        this._session.expired();
                        return;
                    }
                    var headers = this._session.getVars();
                    var me = this,
                        AP = this.AP;
                    var Url, transport, DataSourceBase = {
                        // type: "odata",
                        error: function (e) {
                            try {
                                var status = e.status,
                                    xhr = e.xhr;
                                if (status == 'parsererror' && !xhr.responseText) return;
                                // AP.View.showMsg(me.parseErrorMsg(xhr.responseText));
                            } catch (e) {
                                if (AP.Config.Data.DEBUG) throw e;
                            }
                        },
                        schema: {
                            data: function (response) {
                                if (response.Response == undefined) return [];
                                var Data = response.Response.Data || [];
                                return Data;
                            },

                            total: function (response) {
                                if (response.Response == undefined) return 0;
                                var Data = response.Response.Data || [];
                                return Data.length;
                            }
                        }
                    };
                    if (Querydata.QueryMethod) {
                        Url = path.join(this.Data.APIUrl, Querydata.QueryMethod) + '?Date=' + new Date();
                        DataSourceBase.transport = {
                            /*read: {
                                        url: Url,
                                        headers: $.extend(true, {}, this._getDefaultHeaders(), { "Authorization": "Basic " + headers.auth }),
                                        dataType: "json",
                                        data: Querydata.QueryJsonData,
                                        cache: false,
                                        contentType: "application/json",
                                        type: Querydata.QueryType
                                    },*/
                            read: function (options) {

                                AP.Config.AjaxRequest(Querydata, {
                                    success: function () {
                                        options.success && options.success.apply(this, arguments);
                                    },
                                    error: function () {
                                        options.error && options.error.apply(this, arguments);
                                        return Querydata.DataSource && Querydata.DataSource.handleError && Querydata.DataSource.handleError.apply(this, arguments);
                                    }
                                });
                            }
                            ,
                            parameterMap: function (options, operation) {
                                if (operation == 'read') {
                                    return JSON.stringify(Data);
                                };
                            }
                        };
                    }
                    callback && callback(DataSourceBase);
                    return DataSourceBase;
                },
                _getAuthVM: function () {

                },
                isSessionValid: function () {
                    return this._session.isValid();
                },
                getSessionVars: function () {
                    return this._session.getVars();
                },
                isLoggedIn: function () {
                    return this._session.isLoggedIn;
                },
                /*A jQuery deferred object to handle asynchronous callback in the form of promises*/
                _ensureLoggedIn: null,
                /*Ensures that a valid session is established by returning a promise object*/
                ensureLoggedIn: function () {
                    if (!this._ensureLoggedIn) {
                        this._ensureLoggedIn = $.Deferred();
                        async.nextTick($.proxy(function () {
                            if (this._session.isLoggedIn) {
                                this._ensureLoggedIn.resolve();
                            }
                        }, this));
                    }

                    //See if cookie is still available, if not then reinitialize the deferred object to wait for the user to login.
                    if (this._ensureLoggedIn.state() == "resolved" && !this._session.getVars()) {
                        this._ensureLoggedIn = $.Deferred();
                    }

                    return this._ensureLoggedIn.promise();
                },
                _getAuthHeader: function (callback) {
                    if (this.Data.authHeaderProvider == 'local') {
                        this._session.useLocalAuthHeaderProvider();
                    };
                    this._session.getAuthHeader().done(callback);
                },
                checkLogin: function (config) {
                    var me = this,
                        AP = me.AP,
                        vm = me._getAuthVM(),
                        headers = this._session.getVars();
                    if (!vm || !config || !headers) {
                        config && config.error && config.error();
                        return;
                    }
                    config = config || {};
                    var fields = vm.Form.SubForms[0].FieldSets[0].Fields;
                    if (headers.userName) fields.set('UserName.defaultValue', headers.userName);
                    if (headers.domain) fields.set('Domain.defaultValue', headers.domain);
                    if (headers.staySignedIn) fields.set('StaySignedIn.defaultValue', headers.staySignedIn);
                    AP.View.Waiting.show();

                    var errorMsgLogin = AP.View.Internationalize.translate('sections.errorMsgLogin.text');
                    me._getAuthHeader(function (auth) {
                        me.login({
                            auth: auth,
                            success: function (d) {
                                try {
                                    config.success && config.success.apply(me, arguments);

                                } catch (e) {
                                    if (AP.Config.Data.DEBUG) throw e;
                                }
                            },
                            error: function (error, some, status) {
                                try {
                                    config.error && config.error.apply(this, arguments);
                                } catch (e) {
                                    if (AP.Config.Data.DEBUG) throw e;
                                }
                                return true;
                            }
                        });
                    });
                },
                overrideSettings: function (settings) {
                    var deferred = $.Deferred();
                    deferred.resolve(settings);
                    return deferred.promise();
                },
                logout: function () {
                    this._session.clear();
                    this.AP.Controller.AccessRightsHandler.onLogOut(); // On user log out, clear user's access rights as well
                },

                login: function (config) {
                    var me = this,
                        AP = me.AP,
                        vm = me._getAuthVM();
                    if (!vm || !config) return;
                    vm.generateQuery();
                    var qData = vm.toJSON();
                    var qFields = qData.Form.SubForms[0].FieldSets[0].Fields;
                    var domain = qFields.Domain.defaultValue,
                        userName = domain ? (domain + '\\' + qFields.UserName.defaultValue) : qFields.UserName.defaultValue;
                    var password = qFields.Password.defaultValue;


                    var headers = config.auth || ("Basic " + base64.encode(userName.toLowerCase() + ':' + password));
                    //AP.Controller.route('setculture/es-ES');
                    AP.View.Waiting.show();
                    var errorMsgLogin = AP.View.Internationalize.translate('sections.errorMsgLogin.text'),
                        invalidCredentials = AP.View.Internationalize.translate('sections.invalidCredentials.text');
                    me._ajaxRequestWithHeaders(qData, {
                        success: function (d) {
                            try {
                                AP.View.Waiting.hide();

                                me.Data.UserData = d.AuthenticateResult;


                                if (d.AuthenticateResult == null) {
                                    vm.Messages.set('text', errorMsgLogin);
                                    return;
                                }
                                vm.Messages.set('text', '');

                                var vars = {
                                    auth: headers,
                                    userName: qFields.UserName.defaultValue,
                                    domain: domain,
                                    staySignedIn: qFields.StaySignedIn.defaultValue || false
                                };
                                //check for existing session, if available then extend existing variables instead of replacing with new one
                                var manager = new sessionManagement.manager();
                                vars = $.extend(true, {}, manager.getVars() || {}, vars);
                                manager._clearTimers();
                                manager = null;
                                var next = function () {
                                    //Session is started only if application is running in standalone mode, otherwise it just have assume and continue with what parent application has provided.

                                    me.Data.authHeaderProvider == 'local' && me._session.start(vars, qFields.StaySignedIn.defaultValue);
                                    var continueNext = function () {
                                        me._ensureLoggedIn && me._ensureLoggedIn.resolve(true);
                                        var args = arguments;
                                        me.overrideSettings(me.Data)
                                            .done(function (overrides) {
                                                me.setConfig(overrides).done(function () {
                                                    me._session.setConfig(me.Data.Session);
                                                    me.resetSessionTimeout();
                                                    config.success && config.success.apply(me, args);
                                                });
                                            });
                                    }
                                    me.resetSessionTimeout();
                                    continueNext();
                                }
                                //Update the culture;
                                if (vars.culture) {
                                    AP.Controller.route('setculture/' + vars.culture || AP.Config.Data.locale, {
                                        completed: function () {
                                            next();
                                        }
                                    });
                                } else {
                                    next();
                                }




                            } catch (e) {
                                if (AP.Config.Data.DEBUG) throw e;
                            }
                        },
                        error: function (error, some, status) {
                            try {
                                $.removeCookie(AP_AUTH);
                                AP.View.Waiting.hide();
                                var msg = '';
                                error = error || '';
                                //var parsedErr = AP.Utils.parseCommanErrorMessage(error);
                                //if (!error || 0 === error.length) {
                                //    msg = errorMsgLogin;
                                //} else {
                                //    if (error.toLowerCase().indexOf(invalidCredentials.toLowerCase()) > -1)
                                //        msg = invalidCredentials;
                                //    else if (parsedErr.length)
                                //        msg = parsedErr;
                                //    else if (status.length)
                                //        msg = status;
                                //}
                                msg = invalidCredentials;
                                vm.Messages.set('text', msg);
                                config.error && config.error.apply(this, arguments);

                            } catch (e) {
                                if (AP.Config.Data.DEBUG) throw e;
                            }
                            return true;
                        }
                    }, {
                        auth: headers
                    });
                },
                repeatedAjaxRequest: function (Querydata, Config) {
                    return new ajaxRequestsManager(this.AP, Querydata, Config);
                },
                _getDefaultHeaders: function () {
                    return {
                        "Access-Control-Allow-Origin": "*",
                        appID: this.Data.appname,
                        locale: this.Data.locale
                    };
                },
                onRequestComplete: function (xhr) { },
                _executeRequestWith: function (Querydata, callbacks, headers) {
                    var me = this,
                        AP = this.AP;
                    this.resetSessionTimeout();

                    // Uncommented the following lines Since the APIUrl should be read from Cookie if available else from the Config file

                    var manager = new sessionManagement.manager();
                    var variables = manager.getVars();
                    if (variables && variables.APIUrl && variables.APIUrl != this.Data.APIUrl) {
                        this.Data.APIUrl = variables.APIUrl;
                    }

                    var serviceUrl = path.join(Querydata.usePortalUrl ? this.Data.PortalUrl : this.Data.APIUrl, Querydata.QueryMethod) + '?Date=' + new Date();
                    var jsonData = Querydata.QueryJsonData;
                    if (jsonData && !_.isString(jsonData) && !Querydata.noJsonStringify) jsonData = JSON.stringify(jsonData);
                    return $.ajax({
                        headers: $.extend(true, {}, this._getDefaultHeaders(), {
                            "Authorization": headers.auth
                        }),
                        url: serviceUrl,
                        data: jsonData,
                        type: Querydata.QueryType,
                        processData: false,
                        contentType: Querydata.contentType || "application/json; charset=utf-8",
                        dataType: Querydata.dataType || "json",
                        async: true,
                        cache: false,
                        success: callbacks.success,
                        error: callbacks.error
                    }).done(function (data, status, xhr) { me.onRequestComplete(xhr); })
                    .fail(function (xhr) {
                        me.onRequestComplete(xhr);
                    });
                },
                /*this method is used internally to make ajax request with custom headers*/
                _ajaxRequestWithHeaders: function (Querydata, callbacks, headers) {
                    var me = this,
                        AP = this.AP;
                    (!headers) && (headers = {
                        auth: ''
                    });

                    this.resetSessionTimeout();

                    return me._executeRequestWith(Querydata, {
                        success: function (data, status) {
                            try {
                                if (status != null) {
                                    if (callbacks != null && callbacks.success instanceof Function) {
                                        callbacks.success(data, true);
                                    }
                                }
                            } catch (e) {
                                AP.View.Waiting.hide();
                                if (AP.Config.Data.DEBUG) throw e;
                            }
                        },
                        error: function (xhr, status, error) {
                            try {
                                if (status != null) {
                                    var handled = false;
                                    /*Prevent parser error messages considered as request failiures*/
                                    if (status == 'parsererror' && !xhr.responseText) {
                                        if (callbacks != null && callbacks.success instanceof Function) {
                                            callbacks.success('', true);
                                            return;
                                        }
                                    }
                                    if (callbacks != null && callbacks.error instanceof Function) {
                                        handled = callbacks.error(xhr.responseText, false, status);
                                    }
                                }
                            } catch (e) {
                                AP.View.Waiting.hide();
                                if (AP.Config.Data.DEBUG) throw e;
                            }
                        }
                    }, headers);
                },
                /*this method is used internally to make ajax request for application with session headers*/
                _ajaxRequest: function (Querydata, callbacks) {
                    var me = this,
                        AP = this.AP,
                        headers = this._session.getVars();

                    this.resetSessionTimeout();

                    var deferred = $.Deferred();

                    me._getAuthHeader(function (auth) {

                        headers.auth = auth;

                        if (Querydata.usePortalUrl) {
                            headers.auth = "Basic " + base64.encode((AP.Config.Data.AdminUsername || '') + ':' + (AP.Config.Data.AdminPassword || ''));
                        };

                        me._executeRequestWith(Querydata, {
                            success: function (data, status, xhr) {
                                try {
                                    if (status != null) {
                                        if (callbacks != null && callbacks.success instanceof Function) {
                                            callbacks.success(data, true);
                                        }
                                    }
                                } catch (e) {
                                    AP.View.Waiting.hide();
                                    if (AP.Config.Data.DEBUG) throw e;
                                }
                            },
                            error: function (xhr, status, error) {
                                try {
                                    if (status != null) {
                                        var handled = false;
                                        /*Prevent parser error messages considered as request failiures*/
                                        if (status == 'parsererror' && !xhr.responseText) {
                                            if (callbacks != null && callbacks.success instanceof Function) {
                                                callbacks.success('', true);
                                                return;
                                            }
                                        }
                                        if (callbacks != null && callbacks.error instanceof Function) {
                                            handled = callbacks.error(xhr.responseText, false, status);

                                        }
                                        if (!handled) {
                                            AP.View.showMsg(me.parseErrorMsg(xhr.responseText));
                                        }
                                    }
                                } catch (e) {
                                    AP.View.Waiting.hide();
                                    if (AP.Config.Data.DEBUG) throw e;
                                }
                            }
                        }, headers).done(deferred.resolve).fail(deferred.fail);
                    });
                    return deferred.promise();
                },
                /*This method is actually used by the application to make calls only when a valid session is established*/
                AjaxRequest: function (Querydata, callbacks) {
                    var me = this,
                        AP = this.AP,
                        headers = this._session.getVars();
                    /*
                    The session expiration notification is already taken care within getVars method of sessionManager
                    if (!headers) {
                        this._session.expired();
                        return;
                    }*/
                    me.ensureLoggedIn().done(_.bind(me._ajaxRequest, me, Querydata, callbacks));
                },
                _sessionCleared: function (e) {
                    this._ensureLoggedIn && this._ensureLoggedIn.state() == 'resolved' && (this._ensureLoggedIn = null);
                },
                _sessionStateChanged: function (e) {
                    /*var section = this.AP.Model.ViewModel.get('State.Data.navigationpath') || '';
                            if (section.toLowerCase() == 'sections/login') return;*/
                    switch (e.state) {
                        case sessionStates.expired:
                            this._sessionCleared();
                            //this._expireSession();
                            break;
                        case sessionStates.warning:
                            this._expireWarning(e.warningTicks)
                            break;
                    }
                },
                _removeWarning: function () {
                    var window = this.AP.View.$ViewRoot.find('.SessionExtenderTimer').parents('.APWindow').data('APWidget');
                    _isWarningVisible = false;
                    window && window.destroy();
                },
                _canShowLoginPopup: function () {
                    var hash = this.AP.Model.ViewModel.get('State.Data.navigationpath');
                    return hash != this.Data.loginHandler;
                },
                _expireSession: function () {
                    var vm = this.AP.Config.loadQuery(this.Data.authQueryId);
                    var fields = vm.Form.SubForms[0].FieldSets[0].Fields;
                    var password = fields.Password.defaultValue;
                    this._removeWarning();
                    this._session.clear();
                    this.AP.View.Waiting.hide();
                    this.AP.Controller.onSessionExpired();
                    fields.set('Domain.Enabled', false);
                    fields.set('UserName.Enabled', false);
                    fields.set('Password.defaultValue', '');
                    this._canShowLoginPopup() && this.AP.Controller.route('action/loaddna', this.Data.sessionTimedOutDNA);
                },
                _expireWarning: function (maxTicks) {
                    var AP = this.AP;
                    if (maxTicks > 2) {
                        _isWarningVisible = true;
                        this.Data.sessionTimedOutWarningDNA.MaxTicks = maxTicks;
                        AP.View.Waiting.hide();
                        AP.Controller.route('action/loaddna', this.Data.sessionTimedOutWarningDNA);
                    }
                },
                _onSessionAboutToExpire: function () {
                    // AP.Controller.route('logout');
                    var AP = this.AP;
                    try {
                        this.Data.UserData = null;

                        if (this._session.isValid()) {
                            var headers = this._session.getVars();
                            if (headers && headers.staySignedIn) return;
                        } else {
                            this._session.expired();
                            return;
                        }
                        this._session.warning();
                    } catch (e) {
                        this._session.expired();
                    }
                },
                resetSessionTimeout: function () {
                    (this._session.getState() != sessionStates.disabled) && (this._session.isValid() ? this._session.reset() : this._session.expired());
                },
                _onPageInteracted: function () {
                    (!_isWarningVisible) && this.resetSessionTimeout();
                },
                parseError: function () {

                },
                parseErrorMsg: function () {

                }
            });
            return baseConfig;
        });