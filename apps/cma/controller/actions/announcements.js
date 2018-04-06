define(function () {
    return {
        getAnnouncements: function (args) {
            var AP = args.AP;

            AP.Config.AjaxRequest({
                QueryMethod: 'GetNotifications',
                QueryType: 'GET',
            }, {
                success: function (response) {
                    var vm = AP.Config.loadQuery('CMADataStore').get('Announcements');

                    AP.Controller.route('action/Announcements/getAllReadAnnouncementId', {
                        success: function (readAnnouncementList) {
                            var listToBeDisplayed = [],
                                newItemCount = 0;

                            $.each(response.GetNotificationsResult, function (idx, notification) {
                                if (notification.Status > 0) {
                                    if (readAnnouncementList.indexOf(notification.Id) == -1) {
                                        notification.isNew = true;
                                        newItemCount++;
                                    }
                                    else {
                                        notification.isNew = false;
                                    };

                                    try {
                                        notification.CreatedOn = kendo.parseDate(notification.CreatedOn);
                                    } catch (e) { }

                                    listToBeDisplayed.push(notification);
                                };
                            });

                            listToBeDisplayed = _.sortBy(listToBeDisplayed, function (item) {
                                return item.CreatedOn;
                            }).reverse();

                            response && response.GetNotificationsResult && (vm.set('list', listToBeDisplayed), vm.set('newItems', newItemCount));
                        }
                    });
                    args.success && args.success(response);
                },
                error: function (response) {
                    args.error && args.error(response);
                }
            });
        },
        getAllAnnouncements:function (args) {
            var AP = args.AP;

            AP.Config.AjaxRequest({
                QueryMethod: 'GetAllNotifications',
                QueryType: 'GET',
            }, {
                success: function (response) {
                    var vm = AP.Config.loadQuery('CMADataStore').get('Announcements');

                    $.each(response.GetAllNotificationsResult, function(id, item){
                        var Platforms = [];
                        if(item.ReleaseAndroidApp) Platforms.push('Android');
                        if(item.ReleaseiOSApp) Platforms.push('iOS');
                        if(item.ReleaseWindowsApp) Platforms.push('Windows');
                        response.GetAllNotificationsResult[id].Platforms = Platforms.join(', ');
                        //response.GetAllNotificationsResult[id].Content = response.GetAllNotificationsResult[id].Content.replace(/&lt;/g, "<").replace(/&gt;/g, ">");
                    });
                    //console.log(response.GetAllNotificationsResult);

                    vm.set('allNotifications', response.GetAllNotificationsResult);
                    args.success && args.success(response);
                },
                error: function (response) {
                    args.error && args.error(response);
                }
            });
        },
        createAnnouncement: function (args) {
            var AP = args.AP,
                queryData = AP.Config.loadQuery('CMACreateEditAnnouncement').get('Form').toJSON();

            var SubTitle = new Date(queryData.announcement.SubTitle);
            queryData.announcement.SubTitle = (SubTitle.getMonth()+1)+'/'+SubTitle.getDate()+'/'+SubTitle.getFullYear();
            AP.Config.AjaxRequest({
                QueryMethod: 'SaveNotification',
                QueryType: 'POST',
                QueryJsonData: queryData
            }, {
                success: function (response) {
                    args.success && args.success(response);
                },
                error: function (response) {
                    args.error && args.error(response);
                }
            });
        },
        updateAnnouncement:function (args) {
            var AP = args.AP,
                queryData = AP.Config.loadQuery('CMACreateEditAnnouncement').get('Form').toJSON();
            
            var SubTitle = new Date(queryData.announcement.SubTitle);
            queryData.announcement.SubTitle = (SubTitle.getMonth()+1)+'/'+SubTitle.getDate()+'/'+SubTitle.getFullYear();
            
            AP.Config.AjaxRequest({
                QueryMethod: 'UpdateNotification',
                QueryType: 'POST',
                QueryJsonData: queryData
            }, {
                success: function (response) {
                    args.success && args.success(response);
                },
                error: function (response) {
                    args.error && args.error(response);
                }
            });
        },
        getAllReadAnnouncementId: function (args) {
            var readAnnouncementList = [];

            try {
                readAnnouncementList = JSON.parse(localStorage.getItem('CMA_Announcement_State') || '[]');
            } catch (e) {
                readAnnouncementList = [];
            };

            args.success && args.success(readAnnouncementList);
        },
        markAllActiveAnnouncementsAsRead: function (args) {
            var AP = args.AP;

            AP.Controller.route('action/Announcements/getAllReadAnnouncementId', {
                success: function (readAnnouncementList) {
                    var vm = AP.Config.loadQuery('CMADataStore').get('Announcements'),
                        announcementList = vm.get('list'),
                        newItems = vm.get('newItems');

                    $.each(args.activeNotificationsId, function (idx, notificationId) {
                        if (readAnnouncementList.indexOf(notificationId) == -1) {
                            readAnnouncementList.push(notificationId);
                            announcementList.some(function (item) {
                                if (item.Id == notificationId) {
                                    item.set('isNew', false);
                                    newItems--;
                                    return true;
                                }
                            });
                        };
                    });

                    vm.set('newItems', newItems);

                    localStorage.setItem('CMA_Announcement_State', JSON.stringify(readAnnouncementList));

                    args.success && args.success(readAnnouncementList);
                }
            });
        }
    };
});