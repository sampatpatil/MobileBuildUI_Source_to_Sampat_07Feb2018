define(

    ['kendo', 'async'],

    function (K, async) {

        'use strict';

        var AP;

        var AgilePointControllerRoutes = function (AgilePoint) {

            AP = AgilePoint;

            this.List = {

                // TODO Normalize generic routes
                // Params allways in Args
                'log': {
                    Action: this.RouteHandlers.log,
                    Priority: 0
                }, // Debug
                'init': {
                    Action: this.RouteHandlers.init,
                    Priority: 0
                },
                'logout': {
                    Action: this.RouteHandlers.logout,
                    Priority: 0
                },

                '': {
                    Action: this.RouteHandlers.Navigation.init,
                    Priority: 0
                },
                'go/{path*}': {
                    Action: this.RouteHandlers.Navigation.go,
                    Priority: 0
                },

                'bind': {
                    Action: this.RouteHandlers.ViewModel.bind,
                    Priority: 0
                },
                'state/{Slot}/{Verb}/:Name:/:Value*:': {
                    Action: this.RouteHandlers.ViewModel.state,
                    Priority: 0
                },
                'setculture/:value:': {
                    Action: this.RouteHandlers.View.setCulture,
                    Priority: 0
                },

                'null': {
                    Action: null,
                    Priority: 0
                },

                // APP
                'event/{Event}': {
                    Action: this.RouteHandlers.APP.Events,
                    Priority: 0
                },
                'action/{ActionRoute*}': {
                    Action: this.RouteHandlers.APP.Actions,
                    Priority: 0
                }
            };
        };

        var initNavigation = function (hash, classPath) {
            /* AP.Controller.route('action/loaddna', {
         AP: AP, ClassPath: classPath, completed: function () {*/

            AP.Controller.initHasher();
            /*if (hash) {
        AP.Controller.Hasher.changed.active = false; //disable changed signal
        AP.Controller.Hasher.setHash('');
        AP.Controller.Hasher.changed.active = true; //re-enable changed signal
    }*/
            hash = unescape(hash);
            AP.Controller.Hasher.setHash(hash);
            /*Emulate hash change*/
            AP.Controller.Hasher.changed.dispatch(hash, '');
            //else AP.Controller.route('go/' + (hash || AP.Config.Data.defaultLanding));


            /*}
});*/
        },
            performTransition = function (dna, mode, callback) {
                $.pageslide.close();
                var $elts = AP.View.$ViewRoot.find('.Body>.Blocks>.Content'),
                    method = mode == 'entry' ? 'play' : 'reverse',
                    finalFx;
                if (dna.Transition) {
                    var trans = dna.Transition[mode];
                    $elts = trans.sel ? $elts.find(trans.sel) : $elts;
                    var fx = kendo.fx($elts);
                    switch (trans.fx) {
                        default: finalFx = fx.slideInLeft();
                            break;
                        case 'zoomin':
                            finalFx = fx.zoom('in');
                            break;
                        case 'zoomout':
                            finalFx = fx.zoom('out');
                            break;
                    }
                } else {
                    finalFx = kendo.fx($elts).slideInLeft();

                }
                finalFx ? finalFx[method]().then(callback) : callback && callback();;
            },
            navigate = function (Args, Path, force, skipHashing) {
                if (!force) {
                    var ActualPath = AP.Model.ViewModel.get('State.Data.navigationpath');
                    if (Path == ActualPath) return;
                }
                var goPath = Path.split('/params(')[0];
                kendo.ui.progress(AP.View.$ViewRoot, true);
                AP.Controller.AccessRightsHandler.canNavigate(goPath, function (res) {
                    if (!res.result) {
                        AP.View.confirmKey(AP.Config.Data.PageNotAccessibleMsg, [{
                            action: 'Close'
                        }])
                            .Close(function () {
                                window.history.back();
                            });
                        kendo.ui.progress(AP.View.$ViewRoot, false);
                        return;
                    }

                    (!Args.parameters) && (Args.parameters = {});
                    AP.Model.fetchDNA({
                        Path: goPath
                    }, function (def) {
                        var dna = def(Args);
                        if (dna.IsMaster) {
                            kendo.ui.progress(AP.View.$ViewRoot, false);
                            return;
                        }
                        if (dna.Master && dna.Master != AP.View._currMaster) {
                            AP.Controller.route('action/loaddna', {
                                Path: dna.Master,
                                ClassPath: AP.Config.Data.RootTarget,
                                completed: function () {
                                    async.nextTick(function () {
                                        AP.View._currMaster = dna.Master;
                                        kendo.ui.progress(AP.View.$ViewRoot, false);
                                        justGo(Path, dna, skipHashing);
                                    });
                                }
                            });
                        } else {
                            kendo.ui.progress(AP.View.$ViewRoot, false);
                            var $elts = AP.View.$ViewRoot.find('.Body>.Blocks>.Content');
                            performTransition(dna, 'exit', function () {
                                justGo(Path, dna, skipHashing);
                            });

                        }
                    });

                });

            },
            justGo = function (path, dna, skipHashing) {

                var goPath = path.split('/params(')[0],
                    navArgs = {
                        skipLoad: false,
                        AP: AP,
                        Path: goPath,
                        completed: function () {
                            performTransition(dna, 'entry', function () {
                                AP.View.$ViewRoot.find('.Body>.Blocks>.Content')
                                    .css({
                                        'transform': '',
                                        '-webkit-transform': '',
                                        '-moz-transform': '',
                                        '-ms-transform': '',
                                        '-o-transform': ''
                                    });
                                AP.View.refreshScrollables();
                            });
                        }
                    };

                var icp = AP.Controller.Interceptors.get(goPath),
                    load = function () {
                        if (!skipHashing) {
                            AP.Controller.Hasher.changed.active = false; //disable changed signal
                            AP.Controller.Hasher.setHash(path);
                            AP.Controller.Hasher.changed.active = true; //re-enable signal
                        }
                        //Save navigation state
                        AP.Controller.route('state/Data/set/navigationpath/' + path);

                        // load new content						
                        if (navArgs.skipLoad) {
                            navArgs.completed && navArgs.completed(navArgs.skipLoad);
                            return;
                        }
                        AP.Controller.route('action/loaddna', navArgs);
                        //Let navigation menu update its state based on the section we are in.
                        if (dna && dna.Section && AP.Config.Data.NavMenuSelector) {
                            var menuitemFilter = '[role="menuitem"]',
                                ACTIVE_SEC_CLASS = 'ActiveSection';
                            var sel = '.' + ACTIVE_SEC_CLASS,
                                currSel = '.' + dna.Section;
                            var $navMenu = AP.View.$ViewRoot.find(AP.Config.Data.NavMenuSelector),
                                $section = $navMenu.find(currSel);
                            $navMenu.find(sel + menuitemFilter).not(currSel).removeClass(ACTIVE_SEC_CLASS);
                            if ($section.is(sel)) return;
                            $section.addClass(ACTIVE_SEC_CLASS);
                        }
                    };
                if (icp)
                    icp.onNavigatingFrom({
                        parameters: AP.Utils.getRouteParams(path),
                        from: AP.Controller.Hasher.getHash(),
                        to: path,
                        next: load,
                        navArgs: navArgs
                    });
                else load();

            },
            actionDiscoveries = {},
            executeAction = function (Args, Action) {
                var Route = Action.split('/'),
                        ActionRoute = AP.Controller.Routes.RouteHandlers.APP.Handlers.Actions,
                        RouteText = 'AP.Controller.Routes.RouteHandlers.APP.Handlers.Actions';

                Args.Route = ActionRoute;

                /* Routes debug  */
                if (AP.Config.Data.ShowRouteEvents) {
                    console.log('------------------------------------------------------');
                    console.log('-- widget action -------------------------------------');
                    console.log('to > ' + Action);
                }

                if (!actionDiscoveries.hasOwnProperty(Action)) {
                    var PathStep, lastStep = ActionRoute;
                    while (Route.length > 0) {
                        PathStep = Route.shift();
                        if (Route.length) lastStep = ActionRoute[PathStep];
                        ActionRoute = ActionRoute[PathStep];
                        RouteText += '.' + PathStep;
                        if (!ActionRoute) {

                            if (AP.Config.Data.ShowRouteEvents) {
                                console.log('------------------------------------------------------');
                                console.log('-- action error --------------------------------------');
                                console.log(RouteText);
                            }
                            return;
                        }
                    }
                    actionDiscoveries[Action] = { holder: lastStep, action: PathStep };
                }
                try {
                    var foundAction = actionDiscoveries[Action];
                    if (foundAction) {
                        Args.actionResult = foundAction.holder[foundAction.action](Args);
                    }
                } catch (e) {
                    if (AP.Config.Data.DEBUG) {
                        //console.error && console.error(e.message, e);
                        throw e;
                    }
                }
            };
        AgilePointControllerRoutes.prototype.RouteHandlers = { // TODO move to modules

            log: function (Args) {

                console.log('Route log -----------------------------------');
                console.log(Args);
            },

            // -----------------------------------------------------------------
            init: function (Args) {

                var waitCulture = setInterval(function () {

                    if (AP.View.Internationalize.Ready) {

                        clearInterval(waitCulture);
                        AP.Controller.route();
                    };
                }, 10);
            },

            // -----------------------------------------------------------------
            logout: function (Args) {
                //AP.Controller.route('state/All/init');
                //AP.Controller.Hasher.setHash('');
                /*Args.Path = 'section/login'
                Args.ClassPath = 'EMMain';
                Args.completed = function () { AP.View._currMaster = Args.Path; };
                AP.Controller.route('action/loaddna', Args);*/
                AP.Controller.route('state/Data/set/navigationpath/');
                AP.Controller.route('go/' + AP.Config.Data.loginHandler, Args);
                AP.Config.logout();
                //AP.Controller.Events.App.onLogOut.dispatch();
            },

            // -----------------------------------------------------------------
            Navigation: {

                init: function () {

                    var hash = window.location.hash;
                    if (hash && hash.length > 1 && hash.indexOf('#') == 0) {
                        hash = hash.substr(1);
                    }

                    if (AP.Config.isLoginHandler(hash))
                        hash = AP.Config.Data.defaultLanding;

                    AP.Config.ensureLoggedIn().done(initNavigation.bind(this, hash || AP.Config.Data.defaultLanding));

                    var silentlyLoadLogin = function () {
                        //navigate({ AP: AP }, (hash.length == 0 ? AP.Config.Data.homePage : AP.Config.Data.loginHandler), true, true, false);
                        var pageToBeRouted = '';

                        if (hash.length == 0) {
                            pageToBeRouted = (AP.Config.Data.isStandalone ? AP.Config.Data.homePage : AP.Config.Data.loginHandler);
                        }
                        else {
                            if (AP.Config.isPageAllowedToAccessByUnauthorisedUser(hash)) {
                                pageToBeRouted = hash;
                            }
                            else {
                                pageToBeRouted = AP.Config.Data.loginHandler;
                                AP.Config.Data.redirectUrl = hash;
                            };
                        };

                        initNavigation.call(this, pageToBeRouted);
                    };

                    if (AP.Config.isSessionValid()) {

                        AP.Config.checkLogin({
                            error: function () {
                                //  window.location.href = AP.Controller.getBaseURL();
                                silentlyLoadLogin();
                            }
                        });
                    } else silentlyLoadLogin();

                },
                go: function (Args, Path, force) {
                    if (AP.Config.isLoginHandler(Path) || AP.Config.isPageAllowedToAccessByUnauthorisedUser(Path)) {
                        navigate.call(this, Args, Path, force);
                    }
                    else {
                        AP.Config.ensureLoggedIn().done(_.bind(navigate, this, Args, Path, force, false));
                    }

                }
            },
            // -----------------------------------------------------------------
            View: {

                setCulture: function (Args, Culture) {
                    AP.Config.Data.locale = Culture;

                    AP.View.Internationalize.setCulture(Culture).done(function () {
                        Args.completed();
                    });
                }
            },

            // -----------------------------------------------------------------
            ViewModel: {

                bind: function (Args) {
                    kendo.bind(Args.target || AP.View.$ViewRoot, AP.Model.ViewModel);
                    AP.View[Args.notifyOnlyTarget ? 'notifyBindOnBlock' : 'notifyBind'](Args.target);
                    //kendo.bind(AP.View.$ViewRoot.siblings('.k-window'), AP.Model.ViewModel);
                },

                state: function (Args, Slot, Verb, Name, Value) {
                    AP.Model.state(Args, Slot, Verb, Name, Value);
                }
            },

            // ----------------------------------------------------------------------
            // APP			

            APP: {

                Events: function (Args, Event) {

                    var BlockId = Args.BlockId,
                        ClassPath = AP.Utils.getClassPath(BlockId),
                        EventRoute = AP.Controller.Routes.RouteHandlers.APP.Handlers.Events,
                        RouteText = 'AP.Controller.Routes.RouteHandlers.APP.Handlers.Events';

                    /* Routes debug */
                    if (AP.Config.Data.ShowRouteEvents) {
                        console.log('------------------------------------------------------');
                        console.log('-- widget event --------------------------------------');
                        console.log('in > ' + ClassPath.join('/') + '/' + Event);
                    }

                    while (ClassPath.length > 0) {
                        var PathStep = ClassPath.shift();
                        EventRoute = EventRoute[PathStep];
                        RouteText += '.' + PathStep
                        if (!EventRoute) {

                            if (AP.Config.Data.ShowRouteEvents) {
                                console.log('------------------------------------------------------');
                                console.log('-- event error ---------------------------------------');
                                console.log(RouteText);
                            }
                            return;
                        }
                    }
                    try {
                        if (EventRoute[Event]) {
                            Args.eventResult = EventRoute[Event](Args);
                        };
                    } catch (e) {
                        if (AP.Config.Data.DEBUG) throw e;
                        //  throw e; 
                    }
                },

                Actions: executeAction,

                Handlers: {}
            }

        };

        return AgilePointControllerRoutes;
    }
);