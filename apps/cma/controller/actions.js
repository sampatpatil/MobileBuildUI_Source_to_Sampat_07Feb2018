define(
    [
    'cma/controller/actions/downloadPage',
    'cma/controller/actions/addEditApp',
    'cma/controller/actions/buildApps',
    'cma/controller/actions/userSettings',
    'cma/controller/actions/announcements'
    ],
    function (
        myAppsActions,
        addEditApp,
        buildApps,
        userSettings,
        announcements
        ) {

        'use strict';
        var CMAControllerActions = $.extend(true, {}, {
            loaddna: function (Args) {

                var AP = Args.AP;
                (!Args.Path) && (AP.View._currMaster = Args.Path = 'home');
                var TargetClassPath = Args.ClassPath || 'Root/Body/Content',
                 TargetId = AP.Utils.getBlockIdFromClassPath(TargetClassPath);
                Args.TargetId = Args.TargetId || TargetId;

                AP.Model.loadDNA(Args);
            },

            waiting: {
                close: function () {
                    AP.View.Waiting.close();
                }
            },

            Root: {

                Body: {
                    Content: {
                    }
                }
            },

            Archive: {
                trashOrRestoreApplication: function (args) {
                    var AP = args.AP;

                    AP.Config.AjaxRequest({
                        QueryMethod: kendo.format('TrashOrRestoreApplication/{0}/{1}', args.AppId, args.Status),
                        QueryType: 'POST',
                    }, {
                        success: function (response) {
                            args.success && args.success(response);
                        },
                        error: function (response) {
                            args.error && args.error(response);
                        }
                    });
                }
            },

            ShareLink: {
                share: function (args) {
                    var AP = args.AP,
                        vm = AP.Config.loadQuery('CMAShareLink').get('Data');

                    AP.Config.AjaxRequest({
                        QueryMethod: 'SendMail',
                        QueryType: 'POST',
                        QueryJsonData: {
                            BodyTemplate: AP.Config.Data.shareLinkEmailTemplateId || 'CustomMobileAppDownload',
                            BuildRequestId: vm.get('BuildRequestId'),
                            To: vm.get('To')
                        }
                    }, {
                        success: function (response) {
                            args.success && args.success(response);
                        },
                        error: function (response) {
                            args.error && args.error(response);
                        }
                    });
                }
            },

            DownloadPage: myAppsActions,
            AddEditApp: addEditApp,
            BuildApps: buildApps,
            UserSettings: userSettings,
            Announcements: announcements
        });

        return CMAControllerActions
    });