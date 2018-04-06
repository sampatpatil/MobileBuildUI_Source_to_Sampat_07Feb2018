
define(

    [
        'lib/modules/hasher',
        'lib/modules/crossroads',
        'ap/modules/controller/routes',
        'ap/modules/controller/events',
        'ap/modules/controller/interceptorFactory',
        'ap/modules/controller/accessrightshandler'
    ],

    function (
        Hasher,				// Browser history
        Crossroads,			// Routing		
        Routes,				// Routing paths
        Events,				// Events tree	
        interceptorFactory,  // navigation interceptor factory
        accessRightsHandler  // handler for access rights
    ) {

        'use strict';

        var AP,
            Me;

        var AgilePointController = function (AgilePoint) {

            AP = AgilePoint; // App hook;
            Me = this; // Here for callbacks without context;

            // Navigation (Browser history) routes managed by hasher
            this.Hasher = Hasher;
            Crossroads.ignoreState = true; // enable this allow router to make subsequent routing calls
            // Router setup 
            this.Router = Crossroads;
            this.Routes = new Routes(AP);
            // this.setupDebugRoutes(); // Comment in production

            // Events tree
            this.Events = Events;

            // Initialize the AccessRightsHandler as an empty object ,
            this.AccessRightsHandler = new accessRightsHandler();

            // Initialize interceptor factory to manage the navigation interceptors of an application
            this.Interceptors = interceptorFactory.getFactory(AP);
            //this.Events.Model.onDataQueueComplete.addOnce(this.initHasher, this);
        };

        // ------------------------------------------------------------------------------------
        // OnSession Expired 
        AgilePointController.prototype.onSessionExpired = function () {
            this.AccessRightsHandler.onSessionExpired();
        };
        // Hasher

        // Start hash changes listener
        AgilePointController.prototype.initHasher = function () {

            // hash routes in form: #path/to/route
            this.Hasher.prependHash = '';

            // hash changes handler
            this.Hasher.changed.add(this.handleHashChanges, this);

            // Add initialized listener (to grab initial value in case it is already set)
            //this.Hasher.initialized.add(this.handleInitialHash, this);

            // start listening for history change
            this.Hasher.init();
        };

        // Initial hash
        AgilePointController.prototype.handleInitialHash = function (Hash) {

            if (Hash == '') {
                // get saved hash state
                Hash = AP.Model.ViewModel.get('State.Data.navigationpath') || '';
            };


            if (Hash != '') { this.handleHashChanges(Hash); };
            this.route('state/Data/set/navigationpath/'); // Init hash state
        };

        // Hasher callback for hash navigation routes
        AgilePointController.prototype.handleHashChanges = function (newHash, oldHash) {
            var NavigationRoute = 'go/' + newHash;
            Me.route(NavigationRoute, {});
        };

        // ------------------------------------------------------------------------------------
        // Router

        // Routing app actions without history changes 
        // second parameter is an Args Object, crossroads needs it as an Array,
        // See http://millermedeiros.github.com/crossroads.js/#crossroads-parse
        // and it is received by the actions as first argument (!)
        AgilePointController.prototype.route = function (Route, Args) {

            var Route = Route || '',
                Args = Args || {},
                Args = [$.extend(Args, { AP: AP })]; // Add AP reference for app actions

            this.Router.parse(Route, Args);
            if (Args[0].CanRepeat) { this.Router.parse('null', [{}]); }; // For toggle routes
        };

        AgilePointController.prototype.setupRoutes = function () {

            // Add App specific routing
            $.extend(true, this.Routes.RouteHandlers.APP.Handlers, AP.Config.Controller)

            for (var Route in this.Routes.List) {

                var Action = this.Routes.List[Route].Action,
                    Priority = this.Routes.List[Route].Priority;

                this.Router.addRoute(Route, Action, Priority);
            };
        };

        AgilePointController.prototype.setupDebugRoutes = function () {

            this.Router.routed.add(function (request, data) {

                console.log('Route match ---------------------------------');
                console.log(request);
                console.log(data);
                console.log('---------------------------------------------');
            });

            this.Router.bypassed.add(function (request, data) {

                console.log('Route bypassed ------------------------------');
                console.log(request);
                console.log('---------------------------------------------');
            });
        };

        AgilePointController.prototype.init = function () {

            this.setupRoutes();

            // this.setupDebugRoutes();

            // From here all through routes
            this.route('init');
        };

        // ------------------------------------------------------------------------------------
        // Return SubClass to dependencies tree

        return AgilePointController;
    }
);

