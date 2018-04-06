define(
    ['lib/modules/encoders', 'async', 'underscore',
        'cma/controller/events/myApps',
        'cma/controller/events/appDetails',
        'cma/controller/events/addEditMobileApp',
        'cma/controller/events/buildApps',
        'cma/controller/events/userSettings',
        'cma/controller/events/archive',
        'cma/controller/events/announcements',
        'cma/controller/events/welcome',
    ],
    function (encoders, async, _, myAppEventHandlers, appDetailsEventHandlers, addEditMobileAppEventHandlers, buildApps, userSettings, trashEventHandlers, announcementsHandlers, welcomeEventHandlers) {

        'use strict';
        var base64 = encoders.base64;

        var CMAControllerEvents = $.extend(true, {}, {

                Logo: {
                    // Click event handler.
                    click: function (Args) {
                        var AP = Args.AP,
                            Block = AP.Model.getBlock(Args.BlockId),
                            Url = Block.get('Widget.Data.Url');
                        window.open(Url);
                    }
                },

                LogOut: {
                    // Click event handler.
                    click: function (Args) {
                        Args.AP.Controller.route('logout');
                    }
                },
                LoginForm: {
                    // init event handler.
                    init: function (Args) {
                        var AP = this.App,
                            QueryId = 'EMGetLoginUser',
                            // $Button.addClass('k-state-disabled').attr('disabled', 'true');
                            me = this;

                        // Assigning top value for loginWidget - based on screen size
                        //var loginWidget = AP.View.$ViewRoot.find('.LoginMenu');
                        //var windowHeight = $(window).height();
                        //var topValue = ((windowHeight - loginWidget.height()) / 2);
                        //loginWidget.css({ top: topValue });
                        //

                        var ObservableData = AP.Config.loadQuery(this.widget.QueryId);

                        var dataStr = localStorage.getItem('AP_Auth');
                        if (dataStr != null && dataStr.length <= 1) return;
                        var data = JSON.parse(dataStr);
                        if (data == null || data.staySignedIn == false) return;
                        var qFields = ObservableData.Form.SubForms[0].FieldSets[0].Fields;
                        qFields.set('UserName.defaultValue', data.user);
                        qFields.set('Domain.defaultValue', data.domain);
                        qFields.set('StaySignedIn.defaultValue', true);

                    },
                    /*Login button action handler*/
                    Login: function (Args) {
                        var AP = this.App,
                            $btn = $(Args.e.currentTarget),
                            hash = window.location.hash.substr(1),
                            redirect = hash;
                        if (!redirect || redirect == 'menu/signin')
                            redirect = $btn.attr('data-redirect') || AP.Config.Data.defaultLanding;
                        AP.Config.login({
                            success: function () {
                                var wid = AP.View.$ViewRoot.find('.LoginMenu').data('APWidget');

                                wid && wid.destroy();

                                // Route to null if redirect page is same as current page. 
                                (redirect === hash) && AP.Controller.route('null');

                                AP.Controller.route('go/' + (AP.Config.Data.redirectUrl || redirect), {
                                    forceNavigation: true
                                });

                                AP.Config.Data.redirectUrl = '';

                                //var usertype = AP.Config.Data.UserData.UserType;
                                //if (usertype == "Seller")
                                //    AP.Controller.route('go/sections/managedashboard');
                                //else if (usertype == "Admin")
                                //    AP.Controller.route('go/sections/admindashboard');
                            }
                        });
                    },
                    // Destroy event handler.
                    destroy: function () {
                        var AP = this.App,
                            ObservableData = AP.Config.loadQuery(AP.Config.Data.authQueryId);

                        ObservableData.ClearData();
                    }
                },

                HomeMenuBar: {
                    // Click event handler.
                    click: function (Args) {
                        var AP = this.App,
                            routeMap = {
                                Signin: 'menu/signin',
                                Home: 'sections/home'
                            };
                        var $ele = $(Args.e.item),
                            action = $ele.data('action');
                        action && routeMap[action] && AP.Controller.route(kendo.format('go/' + routeMap[action]), Args);
                    }
                },

                SessionExtenderTimer: {
                    // Stopped event handler.
                    stopped: function (Args) {
                        var window = this.widget.getHostingWindow();
                        window && window.destroy();
                    }
                },
                SessionExtenderActions: {
                    // cancel button action handler.
                    button: function (e) {
                        var window = this.widget.getHostingWindow();
                        window && window.clear();
                    },
                    // Extend action handler.
                    extend: function (e) {
                        this.App.Config.resetSessionTimeout();
                    }
                },
                ProfileMenu: {
                    loadSettingsPage: function (Args) {
                        debugger;
                        this.App.Controller.route(kendo.format('go/sections/userSettings'), Args);
                    },
                    loadChangePasswordPage: function (Args) {
                        this.App.Controller.route(kendo.format('go/sections/changePassword'), Args);
                    },

                },
                DirectDownload: {
                    startDownload: function (Args) {
                        var me = this,
                            AP = this.App,
                            paramList = AP.Utils.getCurrentRouteParams(),
                            buildRequestIdFromParam = paramList[0],
                            dataStore = AP.Config.loadQuery('CMADataStore');

                        if (!buildRequestIdFromParam) return;

                        AP.View.Waiting.show();
                        AP.Controller.route('action/DownloadPage/getBuildRequestDetails', {
                            buildRequestId: buildRequestIdFromParam,
                            success: function (res) {
                                if (res.AppFileName) {
                                    dataStore.set('DirectDownload.message', 'Initiating package download of \'' + res.AppFileName + '\' for ' + res.AppType + '.');
                                    AP.Controller.route('action/DownloadPage/downloadApplication', {
                                        buildRequestId: buildRequestIdFromParam,
                                        fileName: (res.AppFileName || 'MyApplication') + (res.AppType ? ('_' + res.AppType) : '') + '.zip',
                                        success: function () {
                                            AP.View.Waiting.hide();
                                            dataStore.set('DirectDownload.showDownloadButton', false);
                                            dataStore.set('DirectDownload.message', 'Thank you for downloading the app package.');
                                        },
                                        error: function (e) {
                                            AP.View.Waiting.hide();
                                            var fileReader = new FileReader();

                                            fileReader.onload = function (e) {
                                                dataStore.set('DirectDownload.message', AP.Utils.parseCommanErrorMessage(e.target.result));
                                            };

                                            fileReader.readAsText(e);
                                        }
                                    });
                                } else {
                                    //AP.View.showAlert('Invalid build request ID, please check and try again.');
                                    dataStore.set('DirectDownload.message', 'Invalid build request ID, please check and try again.');
                                };
                            }
                        });
                    }
                },
                Toolbar: {
                    init: function (args) {
                        var AP = this.App;
                        AP.Controller.route('action/Announcements/getAnnouncements');
                    },
                    ViewAnnouncements: function (args) {
                        var AP = this.App,
                            vm = AP.Config.loadQuery('CMADataStore').get('Announcements');

                        vm.set('visible', !vm.get('visible'));
                    },
                    HideAnnouncements: function (args) {
                        var AP = this.App,
                            vm = AP.Config.loadQuery('CMADataStore').get('Announcements');

                        vm.set('visible', !vm.get('visible'));
                    },
                    ViewDetails: function (args) {
                        var AP = this.App,
                            vm = AP.Config.loadQuery('CMADataStore').get('Announcements'),
                            announcementId = $(args.e.currentTarget).data('announcement-id') || '',
                            selectedItem = _.findWhere(vm.get('list'), {
                                Id: announcementId
                            });

                        if (!selectedItem) return;

                        vm.get('newItems') && AP.Controller.route('action/Announcements/markAllActiveAnnouncementsAsRead', {
                            activeNotificationsId: [announcementId]
                        });

                        var Platforms = [];
                        if (selectedItem.ReleaseAndroidApp) Platforms.push('Android');
                        if (selectedItem.ReleaseiOSApp) Platforms.push('iOS');
                        if (selectedItem.ReleaseWindowsApp) Platforms.push('Windows');
                        selectedItem.Platforms = Platforms.join(', ');

                        vm.set('visible', false);

                        vm.set('selectedItem', selectedItem);

                        AP.Controller.route('action/loaddna', {
                            Path: 'sections/announcement/announcementDetails'
                        });
                    }
                },
                ShareLink: {
                    sendEmail: function (args) {
                        var AP = this.App;

                        AP.View.Waiting.show();
                        AP.Controller.route('action/ShareLink/share', {
                            success: function (res) {
                                AP.View.showAlertKey(res ? 'Download link shared successfully.' : 'Failed to share download link.');
                                var windowWidget = $(args.e.target).closest('.APWindow.APWidget').data('APWidget');
                                windowWidget.destroy && windowWidget.destroy();
                                AP.View.Waiting.hide();
                            },
                            error: function () {
                                AP.View.Waiting.hide();
                            }
                        });
                    }
                }
            },
            myAppEventHandlers,
            appDetailsEventHandlers,
            addEditMobileAppEventHandlers,
            buildApps,
            userSettings,
            trashEventHandlers,
            announcementsHandlers,
            welcomeEventHandlers,
        );

        return CMAControllerEvents;
    });