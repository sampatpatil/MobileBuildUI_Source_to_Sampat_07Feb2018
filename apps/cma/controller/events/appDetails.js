define(['xmlParser'], function (xmlParser) {

    var buildEmailList = function (emailStr) {
        var emailList = [],
            splitedEmailList = emailStr.split(',');

        $.each(splitedEmailList, function (idx, email) {
            email = email.replace(/\s/g, '');
            if (email && !_.findWhere(emailList, { Value: email })) {
                emailList.push({
                    Name: email,
                    Value: email
                });
            };
        });

        return emailList;
    },
        buildJsonEmailArray = function (emailStr) {
            var list = buildEmailList(emailStr);

            return JSON.stringify(_.pluck(list, 'Value'));
        },
        Enum = {
            EmailListSelector: '[data-role=multicombolist]',
            EmailListWidget: 'kendoMultiComboList'
        },
        importFile = function (AP, fileContent) {
            var vm = AP.Config.loadQuery('CMAUserSettings'),
                dataStoreVM = AP.Config.loadQuery('CMADataStore').get('ActiveAppMetaData'),
                fileName = 'EmailList_' + dataStoreVM.AppBaseId,
                def = $.Deferred();

            if (fileContent) {
                AP.Controller.route('action/UserSettings/getJsonList', {
                    FileName: fileName,
                    success: function (res) {
                        var serverData = null,
                            fileData = null,
                            mainList = null,
                            tempList = null;

                        try {
                            serverData = JSON.parse(res.TextData).EmailList;
                        } catch (e) {
                            serverData = [];
                        };

                        try {
                            fileData = JSON.parse(fileContent).EmailList;
                        } catch (e) {
                            //fileData = [];
                            AP.View.showAlertKey('Selected file is invalid, please select a valid file and try again.');
                            return;
                        };

                        try {
                            if (serverData.length > fileData.length) {
                                mainList = serverData;
                                tempList = fileData;
                            }
                            else {
                                mainList = fileData;
                                tempList = serverData;
                            };

                            $.each(mainList, function (idx, item) {
                                if (!_.findWhere(tempList, { Value: item.Value })) {
                                    tempList.push(item);
                                };
                            });
                        } catch (e) {
                            AP.View.showAlertKey('Selected file is invalid, please select a valid file and try again.');
                            return;
                        };

                        AP.Controller.route('action/UserSettings/saveJsonList', {
                            FileName: fileName,
                            JsonString: JSON.stringify({ EmailList: tempList }),
                            success: function (res) {
                                AP.View.showAlertKey('Notification list imported and saved successfully.');

                                var emailListFromTextbox = (vm.get('Data.EmailList.value') || '').split(','), newList = [];
                                $.each(emailListFromTextbox, function (idx, item) {
                                    item.length && newList.push(item.replace(/\s/g, ''));
                                });

                                $.each(tempList, function (idx, item) {
                                    if (newList.indexOf(item.Value) == -1) {
                                        newList.push(item.Value);
                                    };
                                });

                                vm.set('Data.EmailList.value', newList.join(', '));

                                def.resolve();
                            }
                        });
                    }
                });
            };

            return def.promise();
        },
        saveDistributionList = function (args, skipMessage) {
            var AP = this.App,
                //emailValueField = this.widget.$Block.find(Enum.EmailListSelector).data(Enum.EmailListWidget),
                emailValueField = this.widget.$Block.find(Enum.EmailListSelector),
                addAppVm,
                userSettingsVm = AP.Config.loadQuery('CMAUserSettings'),
                def = $.Deferred();

            if (emailValueField) {

                addAppVm = AP.Config.loadQuery('CMAAddOrEditApp').get('Form');
                addAppVm.set('ApplicationSettings.distributionList', buildJsonEmailArray(userSettingsVm.get('Data.EmailList.value')));

                AP.Controller.route('action/AddEditApp/updateApp', {
                    data: addAppVm,
                    API: 'UpdateMobileApp',
                    success: function (updatedApp) {
                        !skipMessage && AP.View.showAlert('Notification list saved successfully.');
                        def.resolve();
                    },
                    error: def.resolve
                });
            }
            else {
                def.resolve();
            };

            return def.promise();
        },
        openEmailPopupWindow = function (args) {
            var me = this,
                AP = this.App,
                $target = $(args.e ? args.e.currentTarget : args.$target),
                vm = AP.Config.resetQuery('CMAShareLink'),
                buildRequestId = $target.data('build-request-id'),
                platform = $target.data('platform'),
                appData = AP.Config.loadQuery('CMADataStore').get('ActiveAppMetaData'),
                distrubutionList = '';

            try {
                distrubutionList = JSON.parse(appData.get('AppDistributionList')).join(', ');
            } catch (e) {
                distrubutionList = '';
            };

            if (buildRequestId && appData.AppDisplayName && platform) {
                vm.set('Data.AppName', appData.AppDisplayName);
                vm.set('Data.Platform', platform);
                vm.set('Data.AppVersion', appData.AppVersion);
                vm.set('Data.BuildRequestId', buildRequestId);
                vm.set('Data.To', distrubutionList);

                AP.Controller.route('action/loaddna', {
                    Path: 'sections/myApps/shareLink'
                });
            };
        },

        appDetailsEventHandlers = {

            ViewAppDetails: {
                // Widget onInit event handler.
                onInit: function (Args) {
                    var me = this,
                        AP = this.App,
                        selectedAppId = AP.Utils.getCurrentRouteParams()[0] ||  location.href.split('(')[1].split(')')[0],
                        selectedListItems = JSON.parse(AP.Config.loadQuery('CMAAddOrEditApp').get('Form.ApplicationSettings.distributionList') || '[]'),
                        dataStoreVM = AP.Config.loadQuery('CMADataStore').get('ActiveAppMetaData'),
                        userSettingsVm = AP.Config.loadQuery('CMAUserSettings');
                    
                    if (!selectedAppId) {
                        AP.Controller.route('go/sections/myApps');
                        return;
                    };

                    AP.Controller.route('action/UserSettings/getJsonList', {
                        FileName: 'EmailList_' + dataStoreVM.AppBaseId,
                        success: function (res) {
                            var data = null,
                                $emailList = me.widget.$Block.find('.EmailList');

                            //try {
                            //    data = JSON.parse(res.TextData).EmailList;
                            //} catch (e) {
                            //    data = [];
                            //};

                            //var multiSelectWidget = me.widget.$Block.find(Enum.EmailListSelector).data(Enum.EmailListWidget);
                            //multiSelectWidget && (multiSelectWidget.dataSource.data(data), multiSelectWidget.value(selectedListItems));

                            userSettingsVm.set('Data.EmailList.value', (selectedListItems || []).join(', '));

                            $emailList.niceScroll();
                            $emailList.on('keyup', function (e) {
                                $emailList.getNiceScroll().resize();
                            });
                        }
                    });
                },
                openDownloadUrl: function (args) {
                    var me = this,
                        AP = this.App,
                        $target = $(args.e.currentTarget),
                        buildRequestId = $target.data('download-url'),
                        fileName = (AP.Config.loadQuery('CMADataStore').get('ActiveAppMetaData.AppDisplayName') || 'CustomApp'),
                        vm = AP.Config.loadQuery('CMAAddOrEditApp'),
                        platformKeyMap = {
                            Android: 'CreateAndroidApp',
                            iOS: 'CreateiPhoneAndiPadApp',
                            Windows: 'CreateWindowsPhoneApp'
                        },
                        message = '',
                        platform = $target.data('platform');

                    if (vm.get('Form.PlatformSelector.' + platformKeyMap[platform])) {
                        if (vm.get('Controls.Build.' + platform + '.isBuildRequested')) {
                            if (buildRequestId) {
                                AP.View.Waiting.show();
                                AP.Controller.route('action/DownloadPage/downloadApplication', {
                                    buildRequestId: buildRequestId,
                                    fileName: fileName + '_' + platform + '.zip',
                                    success: function () {
                                        AP.View.Waiting.hide();
                                    }
                                });
                            }
                            else {
                                message = 'Build not available for download.';
                            };
                        }
                        else {
                            message = 'There is no build request for the selected platform.';
                        };
                    }
                    else {
                        message = 'Selected platform is not enabled for this mobile application.';
                    };

                    message && AP.View.showAlertKey(message);
                },
                saveDistributionList: function () {
                    var AP = this.App;

                    AP.View.Waiting.show();
                    saveDistributionList.apply(this, arguments).done(function () {
                        AP.View.Waiting.hide();
                    });
                },
                SelectFileForImportEmailList: function (Args) {
                    var me = this,
                        AP = me.App,
                        $fileInput = $('<input type="file"/>');

                    $fileInput.on('change', function (e) {
                        var fileReader = new FileReader();

                        AP.View.Waiting.show();
                        fileReader.onload = function (res) {
                            importFile(AP, res.target.result).done(function () {
                                saveDistributionList.call(me, Args, true).done(function () {
                                    AP.View.Waiting.hide();
                                });
                            });
                        };

                        fileReader.readAsText(e.target.files[0]);
                    });

                    $fileInput.click();
                },
                ImportEmailList: function (Args) {
                    var me = this,
                        AP = this.App,
                        vm = AP.Config.loadQuery('CMAUserSettings'),
                        fileContent = vm.get('Data.EmailList.Content'),
                        dataStoreVM = AP.Config.loadQuery('CMADataStore').get('ActiveAppMetaData'),
                        fileName = 'EmailList_' + dataStoreVM.AppBaseId;

                    if (fileContent) {
                        AP.View.Waiting.show();
                        AP.Controller.route('action/UserSettings/getJsonList', {
                            FileName: fileName,
                            success: function (res) {
                                var serverData = null,
                                    fileData = null,
                                    mainList = null,
                                    tempList = null;

                                try {
                                    serverData = JSON.parse(res.TextData).EmailList;
                                } catch (e) {
                                    serverData = [];
                                };

                                try {
                                    fileData = JSON.parse(fileContent).EmailList;
                                } catch (e) {
                                    fileData = [];
                                };

                                if (serverData.length > fileData.length) {
                                    mainList = serverData;
                                    tempList = fileData;
                                }
                                else {
                                    mainList = fileData;
                                    tempList = serverData;
                                };

                                $.each(mainList, function (idx, item) {
                                    if (!_.findWhere(tempList, { Value: item.Value })) {
                                        tempList.push(item);
                                    };
                                });

                                AP.Controller.route('action/UserSettings/saveJsonList', {
                                    FileName: fileName,
                                    JsonString: JSON.stringify({ EmailList: tempList }),
                                    success: function (res) {
                                        AP.View.showAlertKey('List imported successfully.');

                                        var multiSelectWidget = me.widget.$Block.find(Enum.EmailListSelector).data(Enum.EmailListWidget);
                                        multiSelectWidget && (multiSelectWidget.dataSource.data(tempList));
                                        AP.View.Waiting.hide();
                                    },
                                    error: function () {
                                        AP.View.Waiting.hide();
                                    }
                                });
                            },
                            error: function () {
                                AP.View.Waiting.hide();
                            }
                        });
                    }
                    else {
                        AP.View.showAlertKey('Please select a valid JSON file to import.');
                    };
                },
                ClearEmailList: function (Args) {
                    var me = this,
                        AP = this.App,
                        dataStoreVM = AP.Config.loadQuery('CMADataStore').get('ActiveAppMetaData'),
                        fileName = 'EmailList_' + dataStoreVM.AppBaseId;

                    AP.View.confirmKey('Are you sure you want to clear notification list?').Ok(function () {
                        AP.Controller.route('action/UserSettings/deleteApplicationList', {
                            FileName: fileName,
                            success: function (res) {
                                res && AP.View.showAlertKey('Notification list cleared successfully.');
                                //var multiSelectWidget = me.widget.$Block.find(Enum.EmailListSelector).data(Enum.EmailListWidget);
                                //multiSelectWidget && (multiSelectWidget.dataSource.data([]));

                                AP.Config.loadQuery('CMAUserSettings').set('Data.EmailList.value', '');
                                saveDistributionList.call(me, Args, true);
                            }
                        });
                    });
                },
                OpenEditForm: function (Args) {
                    this.App.Controller.route('go/sections/editApp/editApp', Args);
                },
                OpenRequestBuildWindow: function (Args) {
                    var me = this,
                    AP = me.App,
                    data = {},
                    dataStore = AP.Config.loadQuery('CMADataStore');

                    appFormData = AP.Config.loadQuery('CMAAddOrEditApp').get('Form');

                    var emailListFromQuery = JSON.parse(dataStore.ActiveAppMetaData.AppDistributionList)

                    data = {
                            AppName:dataStore.ActiveAppMetaData.AppDisplayName,
                            EmailList: emailListFromQuery.join(', '),
                            Android: {
                                isAvailable: dataStore.ActiveAppMetaData.Android,
                                selectedToBuild:false,
                                buildType: appFormData.PlatformSelector.AndroidBuildType
                            },
                            iOS: {
                                isAvailable: dataStore.ActiveAppMetaData.iOS,
                                selectedToBuild: false,
                                buildType: appFormData.PlatformSelector.iPhoneAndiPadBuildType
                            },
                            Windows: {
                                isAvailable: dataStore.ActiveAppMetaData.Windows,
                                selectedToBuild: false,
                                buildType: appFormData.PlatformSelector.WindowsPhoneBuildType
                            },
                            isValid: function () {
                                return this.get('Android.selectedToBuild') || this.get('iOS.selectedToBuild') || this.get('Windows.selectedToBuild');
                            }
                        };
                    dataStore.set('NewBuildRequestData', data);
                    this.App.Controller.route('action/loaddna', {
                        Path: 'sections/myApps/requestForBuild'
                    });
                },
                refreshBuildStatus: function (args) {
                    var me = this,
                        AP = this.App;

                    AP.View.Waiting.show();
                    AP.Controller.route('action/BuildApps/loadBuildStatus', {
                        vm: AP.Config.loadQuery('CMAAddOrEditApp'),
                        success: function () {
                            AP.View.Waiting.hide();
                        },
                        error: function () {
                            AP.View.Waiting.hide();
                        }
                    });
                },
                ViewBuildHistory: function () {
                    this.App.Controller.route('action/loaddna', {
                        Path: 'sections/myApps/viewBuildHistory'
                    });
                },
                OpenEmailPopup: function (args) {
                    openEmailPopupWindow.call(this, args);
                },
                MoveToTrash: function (args) {
                    var me = this,
                    AP = me.App,
                    appId = AP.Config.loadQuery('CMADataStore').get('ActiveAppMetaData.AppId');

                    AP.View.confirmKey('Archive this app?', [{ text: 'Yes' }, { text: 'No' }]).Yes(function () {
                        AP.View.Waiting.show();
                        AP.Controller.route('action/Archive/trashOrRestoreApplication', {
                            AppId: appId,
                            Status: 3,
                            success: function (res) {
                                if (!res || !res.TrashOrRestoreApplicationResult) {
                                    AP.View.showAlertKey('Unable to move application to archive. Please check console for more details.');
                                };
                                AP.View.Waiting.hide();
                                AP.Controller.route('go/sections/myApps', args);
                            },
                            error: function () {
                                AP.View.Waiting.hide();
                            }
                        });
                    });
                }
            },
            BuildHistoryWidget: {
                onInit: function () {
                    //this.App.View.Waiting.show();
                    //console.log('BH Widget inited');
                },
                Download: function (args) {

                    var AP = this.App,
                        $target = $(args.e.currentTarget),
                        buildRequestId = $target.data('build-request-id'),
                        platform = $target.data('platform'),
                        fileName = (AP.Config.loadQuery('CMADataStore').get('ActiveAppMetaData.AppDisplayName') || 'CustomApp') + '_' + platform + '.zip';
    
                    if (buildRequestId && !$target.hasClass('Disabled')) {
                        AP.View.Waiting.show();
                        AP.Controller.route('action/DownloadPage/downloadApplication', {
                            buildRequestId: buildRequestId,
                            fileName: fileName,
                            success: function () {
                                AP.View.Waiting.hide();
                            }
                        });
                    };
                },
                ShareLink: function (args) {
                    var $target = $(args.e.currentTarget);
                    !$target.hasClass('Disabled') && openEmailPopupWindow.call(this, args);
                },
                refreshBuildStatus: function (args) {
                    var me = this,
                        AP = this.App;
                    me.widget.refresh();
                }
            }
        };

    return appDetailsEventHandlers;
});