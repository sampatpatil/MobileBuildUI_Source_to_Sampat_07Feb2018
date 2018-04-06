define(function () {
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
    };
    var ColorsArray = ["#a17725", "#d1315e", "#1974e2", "#5e35b1", "#863696", "#e63935", "#27ae60", "#0096b3", "#8f3850", "#ee841d", "#1abc9c", "#6d4c41", "#455a64", "#c48633", "#325d94", "#79a74e", "#95a5a6", "#00646f", "#02695e", "#3b8b3e"],
        commandHandlers = {
            SetFilter: function (args) {
                console.log("hi, its me");
                var me = this,
                    AP = me.App;
                me.widget.KendoWidget.dataSource.filter({ field: "AppDisplayName", operator: "contains", value: "win" });
                
            },
            ViewApp: function (Args) {
                var me = this,
                    AP = me.App,
                    vm = AP.Config.resetQuery('CMAAddOrEditApp'),
                    data = {},
                    dataStore = AP.Config.loadQuery('CMADataStore');

                AP.Config.resetQuery('CMAUserSettings');

                if (Args.rowData.AppId) {
                    dataStore.set('ActiveAppMetaData', Args.rowData);
                    AP.View.Waiting.show();
                    AP.Controller.route('action/DownloadPage/loadXml', {
                        selectedItem: Args.rowData,
                        vm: vm,
                        success: function () {
                            AP.View.Waiting.hide();
                        },
                        error: function () {
                            AP.View.Waiting.hide();
                        }
                    });
                }
                else {
                    AP.Controller.route('go/sections/addApp/addNewApp', Args);
                };
            },
            MoveToTrash: function (args) {
                var me = this,
                    AP = me.App;

                AP.View.confirmKey('Archive this app?', [{ text: 'Yes' }, { text: 'No' }]).Yes(function () {
                    AP.View.Waiting.show();
                    AP.Controller.route('action/Archive/trashOrRestoreApplication', {
                        AppId: args.rowData.AppId,
                        Status: 3,
                        success: function (res) {
                            if (!res || !res.TrashOrRestoreApplicationResult) {
                                AP.View.showAlertKey('Unable to move application to archive. Please check console for more details.');
                            };
                            AP.View.Waiting.hide();
                            me.widget.refresh();
                        },
                        error: function () {
                            AP.View.Waiting.hide();
                        }
                    });
                });
            },
            OpenRequestBuildWindow: function (Args) {
                var me = this,
                    AP = me.App,
                    vm = AP.Config.resetQuery('CMAAddOrEditApp'),
                    data = {},
                    dataStore = AP.Config.loadQuery('CMADataStore');
                
                    appFormData = AP.Config.loadQuery('CMAAddOrEditApp').get('Form');

                    if (Args.rowData.AppDistributionList === "") Args.rowData.AppDistributionList = "[]"; // fix for JSON parsing of empty email list -- Phani
                    var emailListFromQuery = JSON.parse(Args.rowData.AppDistributionList);

                if(Args.rowData.AppId){ 
                    dataStore.set('ActiveAppMetaData', Args.rowData);

                    //injecting values to the Form object in CMAAddOrEditApp query data to ensure correct build info is being passed -- this is because we do not have a populated CMAAddOrEditApp object here -- Phani
                    appFormData.set('ApplicationSettings.Description', Args.rowData.AppDescription);
                    appFormData.set('ApplicationSettings.Name', Args.rowData.AppDisplayName);
                    appFormData.set('ApplicationSettings.Name', Args.rowData.AppDisplayName);
                    appFormData.set('ApplicationSettings.appId', Args.rowData.AppId);
                    appFormData.set('ApplicationSettings.Name', Args.rowData.AppDisplayName);
                    appFormData.set('ApplicationSettings.AppVersion', Args.rowData.AppVersion);

                    AP.View.Waiting.show();
                    AP.Controller.route('action/AddEditApp/getXmlFile', {
                        appId: Args.rowData.AppId,
                        success: function (response) {
                            response.TextData && (Args.rowData.XmlData = response.TextData);
                            var buildTypes = AP.Utils.fetchBuildTypes(response.TextData);

                            data = {
                                AppName:Args.rowData.AppDisplayName,
                                EmailList: emailListFromQuery.join(', '),
                                Android: {
                                    isAvailable: Args.rowData.Android,
                                    selectedToBuild:false,
                                    buildType: buildTypes.Android
                                },
                                iOS: {
                                    isAvailable: Args.rowData.iOS,
                                    selectedToBuild: false,
                                    buildType: buildTypes.iOS
                                },
                                Windows: {
                                    isAvailable: Args.rowData.Windows,
                                    selectedToBuild: false,
                                    buildType: buildTypes.Windows
                                },
                                isValid: function () {
                                    return this.get('Android.selectedToBuild') || this.get('iOS.selectedToBuild') || this.get('Windows.selectedToBuild');
                                }
                            };
                        
                            dataStore.set('NewBuildRequestData', data);
                            AP.View.Waiting.hide();
                            AP.Controller.route('action/loaddna', {
                                Path: 'sections/myApps/requestForBuild'
                            });

                        },
                        error: function () {
                            AP.View.Waiting.hide();
                            AP.View.showAlertKey('Unable to read settings file.');
                            Args.error && Args.error.apply(this, arguments);
                        }
                    });
                }
            },
        };

    var myAppEventHandlers = {
        AppList: {
            init: function(args){
                var me = this,
                    AP = me.App;
                me.widget.KendoWidget.element.css('width', '99%');
                me.widget.KendoWidget.element.css('overflow-x', 'hidden');
                AP.View.refreshScrollables();
            },
            // ListView change event handler.
            change: function (Args) {
                var me = this,
                    AP = me.App,
                    vm = AP.Config.resetQuery('CMAAddOrEditApp'),
                    data = {},
                    dataStore = AP.Config.loadQuery('CMADataStore');

                AP.Config.resetQuery('CMAUserSettings');

                if (Args.selectedItem.AppId) {
                    dataStore.set('ActiveAppMetaData', Args.selectedItem);
                    AP.View.Waiting.show();
                    AP.Controller.route('action/DownloadPage/loadXml', {
                        selectedItem: Args.selectedItem,
                        vm: vm,
                        success: function () {
                            //AP.Controller.route(kendo.format('go/sections/myApps/appDetailsAndDownload/params({0})', Args.selectedItem.AppId), Args);
                            AP.View.Waiting.hide();
                        },
                        error: function () {
                            AP.View.Waiting.hide();
                        }
                    });
                }
                else {
                    AP.Controller.route('go/sections/addApp/addNewApp', Args);
                };
            },
            databound: function (Args) {
                var me = this, AP = me.App,
                    $items = this.widget.$Block.find('.itemContainer'),
                    randomColorIndex = Math.floor(Math.random() * ColorsArray.length),
                    pickNextColorIndex = function () {
                        var nextIndex = randomColorIndex + 1;
                        if (nextIndex == ColorsArray.length) {
                            nextIndex = 0;
                        };
                        randomColorIndex = nextIndex;
                    };
                $.each($items, function () {
                    //$(this).css({ 'background-color': ColorsArray[randomColorIndex] });
                    $(this).css({ 'background-color': '#fff' });
                    //$(this).find('.AppIconHolder').css({ 'background-color': ColorsArray[randomColorIndex]+' !important' });
                    pickNextColorIndex();
                });
            },
            loadComplete: function (args) {
                var me = this, AP = me.App;
                me.widget.KendoWidget.element.css('width', '99%');
                AP.View.refreshScrollables();
            },
            command: function (args) {
                args.command && commandHandlers[args.command] && (commandHandlers[args.command].call(this, args), (args.handled = true));
            },
            RequestForBuild:{
                ClearEmailList: function (Args) {
                    console.log("clearing");
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
            }
        }
    };

    return myAppEventHandlers;
});