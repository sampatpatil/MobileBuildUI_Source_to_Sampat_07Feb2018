define(function () {
    var requestForBuild = function (AP, platform, selectedAppData) {
        var def = $.Deferred();
        AP.Config.AjaxRequest({
            QueryMethod: 'CreateMobileBuild',
            QueryType: 'POST',
            QueryJsonData: {
                "AppBuildVersion": "1",
                "AppFileDescription": selectedAppData.get('ApplicationSettings.Description'),
                "AppFileDisplayName": selectedAppData.get('ApplicationSettings.Name'),
                "AppFileName": selectedAppData.get('ApplicationSettings.Name'),
                "AppId": selectedAppData.get('ApplicationSettings.appId'),
                "AppName": selectedAppData.get('ApplicationSettings.Name'),
                "AppType": platform,
                "AppVersion": selectedAppData.get('ApplicationSettings.AppVersion'),
                "BuildRequestedDate": "\/Date(" + Date.now() + ")\/",
                "BuildRequestedBy": AP.Config.Data.UserData.Username,
                "IsSystemAutorequested": "false",
                "NoOfTimesDownloaded": "0",
                "BuildStatus": 0
            }
        }, {
            success: function (e) {
                def.resolve(e);
            },
            error: function (message) {
                def.resolve({
                    platform: platform,
                    message: message
                });
                return true;
            }
        });

        return def.promise();
    },
        /* Method to get most recent build requests for all available platform using 'AppBuildVersion' property. */
        getRecentBuildRequests = function (buildRequests) {
            var recentBuildRequests = [];

            try {
                recentBuildRequests = _.chain(buildRequests).groupBy('AppType').map(function (requests, appType) {
                    return _.max(requests, function (value) {
                        try {
                            return Number(value.AppBuildVersion);
                        } catch (e) {
                            return value.AppBuildVersion;
                        };
                    });
                }).value();

                !recentBuildRequests.length && (recentBuildRequests = buildRequests);
            } catch (e) {
                console.error(e);
                recentBuildRequests = buildRequests;
            };

            return recentBuildRequests;
        },
        buildAppsActions = {
            createMobileBuild: function (args) {
                var me = this,
                    AP = args.AP,
                    deferredRequests = [],
                    succeededItems = [];

                if (!args.selectedPlatforms.length) {
                    args.success.apply(me, []);
                    return;
                };

                //The following snippet is for the modified API call where we are making one Build Request call to 'CreateMobileBuild' vs. the earlier format where one request per selected platform was sent.
                var platform = args.selectedPlatforms.join(",");
                //if(args.selectedAppData.AppId === "") args.selectedAppData = 
                deferredRequests.push(requestForBuild(AP, platform, args.selectedAppData));


                //The following snippet is the earlier code which used to send one API call per selected platform to 'CreateMobileBuild'
                /*$.each(args.selectedPlatforms, function (idx, platform) {
                    deferredRequests.push(requestForBuild(AP, platform, args.selectedAppData));
                });*/

                $.when.apply($, deferredRequests).done(function () {
                    var errorMessage = '',
                        isErrorExists = false;

                    $.each(arguments, function (idx, item) {
                        if (!item.CreateMobileBuildResult) {
                            errorMessage+='<p class="ErrorTitle">Build request has not been submitted, please find the details below.</p>';
                            errorMessage += ('<p class="ErrorItem"><b>' + item.platform + ': </b>' + AP.Utils.parseCommanErrorMessage(item.message) + '</p>');
                            isErrorExists = true;
                        }
                        else {
                            errorMessage+='<p class="ErrorTitle">Build requested to all selected platforms, please find the details below.</p>';
                            errorMessage += ('<p class="ErrorItem"><b>' + item.CreateMobileBuildResult.AppType + ': </b>Request placed successfully. You will be notified once the build is ready.</p>');
                            var platforms = item.CreateMobileBuildResult.AppType.split(',');
                            var buildRequestIDs = item.CreateMobileBuildResult.BuildRequestId.split(',');
                            

                            // start of new snippet: this is to handle the merged result of the new approach where we make one common call for all selected platforms. Here we split the joined platform types and populate the succeededItems array so that the call from the "Publish" method on ../events/addEditMobileApp.js gets desired response data. -- Phani
                            var pcount = 0;
                            $.each(platforms, function (p, platform){
                                var succeededBuild = item.CreateMobileBuildResult;
                                succeededBuild.AppType = platforms[pcount];
                                succeededBuild.BuildRequestId = buildRequestIDs[pcount];
                                succeededItems.push(succeededBuild);
                                pcount++;
                            });
                            // end of new snippet -- Phani


                            //succeededItems.push(item.CreateMobileBuildResult); //the following snippet is from the earlier code where one API calls per selected platform was made for build request
                        };
                    });

                    AP.View.showMsg({
                        //width:'700',
                        content: {
                            template: '<div class="windowInfoIcon '+(isErrorExists?'Error':'Info')+'"><span>'+(isErrorExists?'X':'&\\#10004;')+'</span></div><div style="margin-left:70px">'+errorMessage+'</div>'
                        }
                    });
                    args.success.apply(me, succeededItems);
                }).fail(function () {
                    args.error && args.error();
                });
            },
            getMobileBuild: function (args) {
                args.AP.Config.AjaxRequest({
                    QueryMethod: kendo.format('GetMobileBuild/{0}', args.appId || 'dummy_app'), // The string 'dummy_app' has been used as a fallback in case there is an error with the build request and there is no AppID.
                    QueryType: 'GET',
                }, {
                    success: function (e) {
                        args.success && args.success(e);
                    },
                    error: function (e) {
                        args.error && args.error(e);
                    }
                });
            },
            loadBuildStatus: function (args) {
                var me = this,
                    AP = args.AP;

                me.getMobileBuild($.extend(true, { AP: AP, appId: args.vm.get('Form.ApplicationSettings.appId') }, {
                    success: function (res) {
                        if (res.length) {

                            /* Get most recent build requests for all available platform using 'AppBuildVersion' property. */
                            res = getRecentBuildRequests(res);

                            args.vm.set('Controls.isBuildRequestExists', true);

                            $.each(res, function () {
                                var status = 'status_' + this.BuildStatus;

                                if (this.BuildRequestId) {
                                    args.vm.set('Controls.Build.' + this.AppType + '.isBuildRequested', true);

                                    if (this.AppDownloadURL) {
                                        args.vm.set('Controls.Build.' + this.AppType + '.buildRequestId', this.BuildRequestId);
                                    }
                                    else {
                                        args.vm.set('Controls.Build.' + this.AppType + '.buildRequestId', '');
                                    };

                                    args.vm.set('Controls.Build.' + this.AppType + '.status', AP.View.Internationalize.translate('sections.editApp.appBuildStatus.' + status));
                                };
                            });
                        };

                        args.success && args.success(args.vm);
                    },
                    error: args.error
                }));
            }
        };

    return buildAppsActions;
});