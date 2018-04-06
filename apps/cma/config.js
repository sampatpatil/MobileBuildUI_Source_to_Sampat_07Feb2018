define([
  'ap/modules/baseConfig',
  'cma/lib/validation/rulesCollection',
  // queries
  'cma/queries/users/GetLoginUser',
  'cma/queries/myApps/getCustomizedApps',
  'cma/queries/myApps/getTrashedApps',
  'cma/queries/myApps/requestForNewBuild',
  'cma/queries/myApps/getBuildHistory',
  'cma/queries/myApps/shareLink',
  'cma/queries/addEditApp/getReleasedApplications', 
  //'cma/queries/addEditApp/getGlobalUserSettings',
  'cma/queries/addEditApp/downloadApp',
  'cma/queries/addEditApp/addOrEditApp',
  'cma/queries/users/userSettings',
  'cma/queries/datastore',
  'cma/queries/createEditAnnouncement',
  // app logic
  'cma/controller/interceptors',
  'cma/controller/events',
  'cma/controller/actions',
  'cma/controller/accessrightshandler'
],

    function (
        baseConfig, rules
    ) {

        'use strict';
        var buildArgs = arguments;
        /*Note: Extracting events and actions from arguments list
		the values are being extracted directly from arguments list to prevent parameter mismatch.
		This is the only place where the parameter values are retrived in this manner.
		*/
        var CMAControllerEvents = arguments[arguments.length - 3],
            CMAControllerActions = arguments[arguments.length - 2],
            Interceptors = arguments[arguments.length - 4],
            AccessRightsHandler = arguments[arguments.length - 1];


        // For avoiding "No- Transport" error
        // force cross-site scripting
        $.support.cors = true;
        var extractQuery = function (query) {
            var q = query;
            if (q.vm && _.isFunction(q.vm)) q = q.vm;
            return q;

        };
        var buildQueryList = function (startIndex, length) {
            startIndex = startIndex || 0;
            length = length || buildArgs.length;
            var queries = {};
            for (var i = startIndex; i < length; i++) {
                var query = buildArgs[i];

                if (_.isArray(query)) {
                    _.each(query, function (qtemp) {
                        queries[qtemp.Id] = extractQuery(qtemp);
                    })
                } else
                    queries[query.Id] = extractQuery(query);


            }
            return queries;
        };

        var _queries = buildQueryList(2, arguments.length - 4);
        var Config = baseConfig.extend({
            onInit: function (Overrides) {
                $(document).on('click', $.proxy(this._onPageInteracted, this));
                // Add extra config set from index.html
                $.extend(true, this.Data, Overrides);
                this.Queries = _queries;
            },
            Dialog: {
                DefaultTitle: 'Mobile App Accelerator'
            },
            CustomWidgets: [],
            ACL: {
                Auth: {
                    Masters: {
                        root: false,
                        home: true
                    }
                }
            },
            Data: {
                defaultMaster: 'root',
                defaultLanding: 'sections/Welcome', // Default red-direct location after login
                DEBUG: true,
                Name: 'Customize Mobile Apps',
                Prefix: 'AP', // For Block & DOM ids
                RootPath: 'apps/cma/', // Resources root path
                DOMViewContainerId: 'body', // Optional, if not set, 'body' is default
                APIUrl: 'http://localhost/agilepointserver/',
                StaticContentUrl: 'apps/cma/content/', // html / svg / etc.
                UserData: null,
                SharedCustmAttrID: 'GLOBAL:{F09E4B16-466D-41a7-8EC2-0936D9D5DDE1}',
                // Widgets
                GridPageSize: 30, // Default page size for grids, override in dna or query
                DelayTimer: 1000, // Delay for fetchs that depends on grid selected rows, etc
                ClockInterval: 10,
                ProcessMonitorRefreshInterval: 3, // refresh interval in seconds
                Session: {
                    timeout: 60, // Session timout in minutes
                    warningTimeoutWindow: 2, // How many minutes before the warning message should occur session times out
                    staySignedInFor: 14 // Maximum for how many days the session can be valid if user is signed with stay signed option enabled
                },
                validationRules: null,
                appname: "CMA",
                homePage: 'sections/home',
                sessionTimedOutDNA: {
                    ClassPath: 'Root/Body/Content',
                    Path: 'menu/signin'
                },
                sessionTimedOutWarningDNA: {
                    ClassPath: 'Root',
                    Path: 'sessionextender'
                },
                authQueryId: 'CMAGetLoginUser',
                accessRightsQueryId: '',
                PageNotAccessibleMsg: 'accessrights.pagenotaccessible',  // Message key for displaying the message 'page not accessible'
                // Debug
                ShowRouteEvents: false, // Controller.Routes shows event route in console
                ShowWidgetClasPath: false, // View.Widget shows widget class path
                SaveState: false, // Save ui & query sessions
                VersionIncrementalStep: 0.01, // The default step value of the checkin version from the current version
                WindowRenderTarget: '#CMAMain', // The jquery selector string to target the element under where the window gets rendered
                NavMenuSelector: '.SectionsMenu', // The jQuery Selector string to find out where is navigations menu is.
                RootTarget: 'CMAMain',
                InitialUsersFetchLimit: 50, // The no of users to be fetched by default in user autocomplete textbox or combobox
                //Server Details
                locale: "en-US",
                isImageSizeValidationRequired: true,
                redirectUrl: '',
                copyRightInfo: ''
            },

            // App logic
            Controller: {
                Events: CMAControllerEvents,
                Actions: CMAControllerActions
            },
            onAppReady: function () {
                var AP = this.AP;

                _.each(Interceptors(AP), function (icp) {
                    AP.Controller.Interceptors.register(new icp());
                });

                var extractedARHandler = new AccessRightsHandler(AP);
                AP.Controller.AccessRightsHandler = new extractedARHandler();

                this.loadQuery('CMADataStore');

                baseConfig.fn.onAppReady.apply(this, arguments);

                //this.Data.validationRules = rules(AP);

                this.Data.isStandalone && AP.Model.ViewModel.State.get('Interface').push('Standalone');
            },
            _getAuthVM: function () {
                return this.loadQuery(this.Data.authQueryId);
            },
            isReqdToCheckValidSession: function (currentPageMaster) {
                var AP = this.AP;
                if (!currentPageMaster) return true;
                return this.ACL.Auth.Masters[currentPageMaster];
            },
            parseError: function (res) {
                if (!res) return '';
                var startTag = 'AgilePointServerException',
                    endTag = 'AgilePointServerException',
                    first = res.indexOf(startTag) + startTag.length,
                    last = res.lastIndexOf(endTag);
                if (first == last || first > last) return '';
                var msg = res.substr(first, last - first);
                if (msg.indexOf('#') > -1) {
                    msg = msg.replace(/([#])/, "\\#");
                }
                return msg;
            },
            parseErrorMsg: function (respone) {
                var msg = this.parseError(respone),
                    tmpl = {
                        content: null
                    };
                if (msg) tmpl.content = {
                    template: msg
                };
                return tmpl;
            },
            _onPageInteracted: function () {
                this.ACL.Auth.Masters[this.AP.View._currentMaster] && baseConfig.fn._onPageInteracted.apply(this, arguments);
            },
            getBreadCrumbsPath: function (path) {
                if (path.indexOf('sections/details/params') > -1)
                    path = 'sections/details';

                return path || '';
            },
            getHashPath: function (oldpath) {
                var AP = this.AP,
                    oldpath = oldpath.split('/params(')[0],
                    interceptor = AP.Controller.Interceptors.get(oldpath);
                var path = (interceptor && interceptor.parentHash) ? interceptor['parentHash'] : (AP.COnfig.Data.isStandalone ? 'sections/home' : 'sections/myApps');
                return path;
            },
            getApiUrl: function () {
                return this.Data.APIUrl;
            },
            getEncodedSql: function (sqlQuery) {
                return this.base64.encode(sqlQuery);
            },
            isPageAllowedToAccessByUnauthorisedUser: function (path) {
                //return this.Data.loginHandler === path || (this.Data.isStandalone && (this.Data.homePage === path)) || (path === 'sections/home');

                return this.Data.loginHandler === path;
            },

            /* Method to make custom ajax request to get response as blob and other types which are not supported by jQuery Ajax method. */
            customAjaxRequest: function (queryData, options) {
                var me = this,
                    xhr = new XMLHttpRequest(),
                    def = $.Deferred(),
                    headers = $.extend(true, {}, me._getDefaultHeaders(), { 'Authorization': me._session.getVars().auth }, (options && options.headers) || {});

                xhr.onreadystatechange = function () {
                    if (this.readyState == 4 && this.status == 200) {
                        options.success && options.success(this.response);
                        def.resolve(this.response);
                    }
                    else if (this.readyState == 4) {
                        options.error && options.error(this.response);
                        def.reject(this.response);
                    };
                };

                xhr.open(queryData.QueryType, me.AP.Utils.path.join(me.Data.APIUrl, queryData.QueryMethod));
                xhr.responseType = queryData.contentType;

                $.each(headers, function (key, value) {
                    xhr.setRequestHeader(key, value);
                });

                xhr.send();

                return def.promise();
            },
            updateConfigData: function () {
                var def = $.Deferred();
                this.Data.validationRules = rules(this.AP);

                def.resolve();

                return def.promise();
            },
            getUserName: function () {
                var userName = this.Data.UserData.Username;
                try {
                    var list = userName.split('\\');
                    return list[list.length - 1];
                }
                catch (e) {
                    return userName.replace(/\s\\/, '');
                };
            }
        });
        return Config;
    }
);