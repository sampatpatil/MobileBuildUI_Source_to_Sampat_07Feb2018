define(['xmlParser'], function (xmlParser) {
    var customValidations = {
        AuthenticationConfiguration: function (Args, vm) {
            var AP = this.App,
                selectedConfigs = _.where(vm, { isSelected: true }), isValidDefaultConfigSelected = vm.get(vm.get('defaultConfig') + '.isSelected'),
                serverConfigUrls = vm.get('ServerConfiguration'),
                def = $.Deferred();

            if (!selectedConfigs.length) {
                AP.View.showAlertKey('sections.addNewApp.messages.AuthenticationConfiguration.noneSelected');
                def.reject();
            }
            else if (!isValidDefaultConfigSelected) {
                AP.View.showAlertKey('sections.addNewApp.messages.AuthenticationConfiguration.invalidDefaultConfigSelected');
                def.reject();
            }
            else {
                def[isValidDefaultConfigSelected ? 'resolve' : 'reject']();
            };

            return def.promise();
        },
        ApplicationFilter: function (Args, formVm) {
            var me = this,
                AP = this.App,
                vm = AP.Config.loadQuery('CMAUserSettings'),
                fileContent = vm.get('Data.ApplicationList.Content'),
                fileName = 'ApplicationList_' + AP.Config.Data.UserData.Username.replace(/\\/g, '_'),
                def = $.Deferred();


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
                            serverData = JSON.parse(res.TextData).ApplicationList;
                        } catch (e) {
                            serverData = [];
                        };

                        try {
                            fileData = JSON.parse(fileContent).ApplicationList;
                        } catch (e) {
                            //fileData = [];
                            AP.View.showAlertKey('Selected file is invalid, please select a valid file and try again.');
                            AP.View.Waiting.hide();
                            def.reject();
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
                            def.reject();
                            return;
                        };

                        AP.Controller.route('action/UserSettings/saveJsonList', {
                            FileName: fileName,
                            JsonString: JSON.stringify({ ApplicationList: tempList }),
                            success: function (res) {
                                //AP.View.showAlertKey('List imported successfully.');
                                var filterList = me.widget.$Block.closest('.APWizardStep').find('.ApplicationFilterList').data('APWidget'),
                                    fileUploader = me.widget.$Block.closest('.APWizardStep').find('.ImportControlField [data-role=filereader]').getKendofileReader();

                                filterList && filterList.refresh && filterList.refresh();

                                // Clear file and content.
                                vm.set('Data.ApplicationList.Content', '');
                                fileUploader && fileUploader._module.element.addClass('k-upload-empty').find('.k-upload-files').remove();

                                AP.View.Waiting.hide();

                                def.resolve();
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
                def.resolve();
            };

            return def.promise();
        },
        NotificationListForm: function () {
            var me = this,
                AP = this.App,
                vm = AP.Config.loadQuery('CMAUserSettings'),
                fileContent = vm.get('Data.EmailList.Content'),
                dataStoreVM = AP.Config.loadQuery('CMADataStore').get('ActiveAppMetaData'),
                fileName = 'EmailList_' + dataStoreVM.AppBaseId,
                def = $.Deferred();

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
                            AP.View.showAlertKey('Selected file is invalid, please select a valid file and try again.');
                            AP.View.Waiting.hide();
                            def.reject();
                            return;
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
                                var multiSelectWidget = me.widget.$Block.find(Enum.EmailListSelector).data(Enum.EmailListWidget);
                                multiSelectWidget && (multiSelectWidget.dataSource.data(tempList));
                                AP.View.Waiting.hide();
                                def.resolve();
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
                def.resolve();
            };

            return def.promise();
        }
    },
        commandHandlersForListView = {
            RemoveApplication: function (Args) {
                var AP = this.App,
                    selectedAppList = AP.Config.loadQuery(this.widget.$Block.closest('.APWizardStep').data('APWidget')._config.QueryId).get('Form.ApplicationFilter.SelectedApps'),
                    index = _.indexOf(selectedAppList, Args.$item.data('rowData'));

                if (index > -1) {
                    selectedAppList.splice(index, 1);
                }
            }
        },
        utils = {
            downloadDummyItem: function (fileName) {
                var blob = new Blob(['empty file'], { type: 'application/octet-stream' });

                if (window.navigator.msSaveBlob) {
                    // For IE.
                    window.navigator.msSaveBlob(blob, fileName);
                }
                else if (/constructor/i.test(window.HTMLElement)) {
                    // For safari.
                    var url = 'data:text/plain;charset=utf-8,' + window.encodeURIComponent(fileContent),
                        popup = window.open(url, '_blank');
                    if (!popup) window.location.href = url;
                }
                else {
                    // For other browsers.
                    var elem = document.createElement('a');
                    elem.href = window.URL.createObjectURL(blob);
                    elem.download = fileName;
                    document.body.appendChild(elem);
                    elem.click();
                    elem.remove();
                };
            }
        },
        saveCurrentStep = function (Args) {
            debugger;
            var me = Args,
                AP = Args.App,
                addAppVm = AP.Config.loadQuery('CMAAddOrEditApp').get('Form'),
                xmlTemplatePath = 'apps/cma/content/sections/addApp/appConfigurationTemplate',
                def = $.Deferred(),
                dataStore = AP.Config.loadQuery('CMADataStore');

            AP.View.Waiting.show();
            if ($(Args.e.currentTarget).attr('disabled') == 'disabled') {
                return false;
            };
            try {
                var finish = function (appDetails) {
                    //var vm = AP.Config.resetQuery('CMAAddOrEditApp');
                    vm.set('Controls.enableDownload', true);
                    AP.Controller.route('action/DownloadPage/loadXmlEachStep', {
                        selectedItem: appDetails,
                        vm: vm,
                        success: function (vm) {
                            def.resolve(vm);
                            //AP.Controller.route(kendo.format('go/sections/myApps/appDetailsAndDownload/params({0})', appDetails.AppId), Args);
                            AP.View.Waiting.hide();
                        }
                    });
                },
                    uploadFiles = function (appDetails) {
                        debugger;
                        $.when(updateImageIdsEachStep.call(me, { appId: appDetails.AppId }), updateCertificateIdsEachStep.call(me, { appId: appDetails.AppId, oldAppId: addAppVm.ApplicationSettings.appId })).done(function () {

                            var xmlString = AP.View.Templates.renderTemplate({ Path: xmlTemplatePath, Extension: '.xml' }, { xmlData: addAppVm }),
                                userSettingsVm = AP.Config.loadQuery('CMAUserSettings');

                            addAppVm.set('ApplicationSettings.appLogoId', (addAppVm.get('UploadImages.Windows.Logo.Id') || addAppVm.get('UploadImages.Android.HDPI.Logo.Id') || addAppVm.get('UploadImages.iOS.Icon.Id') || addAppVm.get('UploadImages.iOS.Logo.Id')));

                            addAppVm.set('ApplicationSettings.appId', appDetails.AppId);

                            appDetails.AppLogo = addAppVm.get('ApplicationSettings.appLogoId');

                            var emailStr = buildJsonEmailArray(userSettingsVm.get('Data.EmailList.value'));
                            addAppVm.set('ApplicationSettings.distributionList', emailStr);
                            appDetails.AppDistributionList = emailStr;

                            AP.Controller.route('action/AddEditApp/updateApp', {
                                data: addAppVm,
                                API: 'UpdateMobileApp',
                                statusCode: Args.statusCode,
                            });

                            AP.Controller.route('action/AddEditApp/saveXmlFile', {
                                xmlString: xmlString,
                                appId: appDetails.AppId,
                                success: function () {
                                    finish(appDetails);
                                }
                            });
                        });
                    };

                if (addAppVm.get('ApplicationSettings.appId')) {
                    AP.Controller.route('action/AddEditApp/updateApp', {
                        data: addAppVm,
                        statusCode: Args.statusCode,
                        success: function (updatedApp) {
                            dataStore.set('ActiveAppMetaData', updatedApp.UpdateMobileAppDraftOrPublishResult);
                            uploadFiles(updatedApp.UpdateMobileAppDraftOrPublishResult);
                        },
                        error: function (errorMessage) {
                            AP.View.Waiting.hide();
                            AP.View.showMsg({
                                width: '700',
                                content: {
                                    template: AP.Utils.parseCommanErrorMessage(errorMessage)
                                }
                            });
                        }
                    });
                }
                else {
                    AP.Controller.route('action/AddEditApp/createApp', {
                        data: addAppVm,
                        statusCode: Args.statusCode,
                        success: function (addedApp) {
                            dataStore.set('ActiveAppMetaData', addedApp.CreateMobileAppResult.MobileApplication);

                            /* If PublisherId is empty then, AppBaseId will be used while creating build. */
                            //!addAppVm.get('StoreCertificate.WindowsCertificate.PublisherId') && addAppVm.set('StoreCertificate.WindowsCertificate.PublisherId', 'CN=' + AP.Config.getUserName());

                            !addAppVm.get('StoreCertificate.WindowsCertificate.PhonePublisherId') && addAppVm.set('StoreCertificate.WindowsCertificate.PhonePublisherId', addedApp.CreateMobileAppResult.PhonePublisherId);

                            addAppVm.set('ApplicationSettings.appBaseId', addedApp.CreateMobileAppResult.MobileApplication.AppBaseId || '');
                            //sam change
                            addAppVm.set('ApplicationSettings.appId', addedApp.CreateMobileAppResult.MobileApplication.AppId || '');

                            addAppVm.set('StoreCertificate.WindowsCertificate.PhoneProductId', addedApp.CreateMobileAppResult.PhoneProductId || '');

                            uploadFiles(addedApp.CreateMobileAppResult.MobileApplication);
                        },
                        error: function (errorMessage) {
                            AP.View.Waiting.hide();
                            AP.View.showMsg({
                                width: '700',
                                content: {
                                    template: AP.Utils.parseCommanErrorMessage(errorMessage)
                                }
                            });
                        }
                    });
                };
            }
            catch (e) {
                AP.View.showAlertKey('sections.addNewApp.messages.templateFailedToCreate');
            };

            return def.promise();
        },
        addOrUpdateApplication = function (Args) {
            debugger;
            var me = this,
                AP = this.App,
                addAppVm = AP.Config.loadQuery(this.widget.QueryId).get('Form'),
                xmlTemplatePath = 'apps/cma/content/sections/addApp/appConfigurationTemplate',
                def = $.Deferred(),
                dataStore = AP.Config.loadQuery('CMADataStore');

            AP.View.Waiting.show();
            if ($(Args.e.currentTarget).attr('disabled') == 'disabled') {
                return false;
            };
            try {
                var finish = function (appDetails) {
                    var vm = AP.Config.resetQuery('CMAAddOrEditApp');
                    vm.set('Controls.enableDownload', true);
                    AP.Controller.route('action/DownloadPage/loadXml', {
                        selectedItem: appDetails,
                        vm: vm,
                        success: function (vm) {
                            def.resolve(vm);
                            //AP.Controller.route(kendo.format('go/sections/myApps/appDetailsAndDownload/params({0})', appDetails.AppId), Args);
                            AP.View.Waiting.hide();
                        }
                    });
                },
                    uploadFiles = function (appDetails) {
                        debugger;
                        $.when(updateImageIds.call(me, { appId: appDetails.AppId }), updateCertificateIds.call(me, { appId: appDetails.AppId, oldAppId: addAppVm.ApplicationSettings.appId })).done(function () {

                            var xmlString = AP.View.Templates.renderTemplate({ Path: xmlTemplatePath, Extension: '.xml' }, { xmlData: addAppVm }),
                                userSettingsVm = AP.Config.loadQuery('CMAUserSettings');

                            addAppVm.set('ApplicationSettings.appLogoId', (addAppVm.get('UploadImages.Windows.Logo.Id') || addAppVm.get('UploadImages.Android.HDPI.Logo.Id') || addAppVm.get('UploadImages.iOS.Icon.Id') || addAppVm.get('UploadImages.iOS.Logo.Id')));

                            addAppVm.set('ApplicationSettings.appId', appDetails.AppId);

                            appDetails.AppLogo = addAppVm.get('ApplicationSettings.appLogoId');

                            var emailStr = buildJsonEmailArray(userSettingsVm.get('Data.EmailList.value'));
                            addAppVm.set('ApplicationSettings.distributionList', emailStr);
                            appDetails.AppDistributionList = emailStr;

                            AP.Controller.route('action/AddEditApp/updateApp', {
                                data: addAppVm,
                                API: 'UpdateMobileApp',
                                statusCode: Args.statusCode,
                            });

                            AP.Controller.route('action/AddEditApp/saveXmlFile', {
                                xmlString: xmlString,
                                appId: appDetails.AppId,
                                success: function () {
                                    finish(appDetails);
                                }
                            });
                        });
                    };

                if (addAppVm.get('ApplicationSettings.appId')) {
                    AP.Controller.route('action/AddEditApp/updateApp', {
                        data: addAppVm,
                        statusCode: Args.statusCode,
                        success: function (updatedApp) {
                            dataStore.set('ActiveAppMetaData', updatedApp.UpdateMobileAppDraftOrPublishResult);
                            uploadFiles(updatedApp.UpdateMobileAppDraftOrPublishResult);
                        },
                        error: function (errorMessage) {
                            AP.View.Waiting.hide();
                            AP.View.showMsg({
                                width: '700',
                                content: {
                                    template: AP.Utils.parseCommanErrorMessage(errorMessage)
                                }
                            });
                        }
                    });
                }
                else {
                    AP.Controller.route('action/AddEditApp/createApp', {
                        data: addAppVm,
                        statusCode: Args.statusCode,
                        success: function (addedApp) {
                            debugger;
                            dataStore.set('ActiveAppMetaData', addedApp.CreateMobileAppResult.MobileApplication);

                            /* If PublisherId is empty then, AppBaseId will be used while creating build. */
                            //!addAppVm.get('StoreCertificate.WindowsCertificate.PublisherId') && addAppVm.set('StoreCertificate.WindowsCertificate.PublisherId', 'CN=' + AP.Config.getUserName());

                            !addAppVm.get('StoreCertificate.WindowsCertificate.PhonePublisherId') && addAppVm.set('StoreCertificate.WindowsCertificate.PhonePublisherId', addedApp.CreateMobileAppResult.PhonePublisherId);

                            addAppVm.set('ApplicationSettings.appBaseId', addedApp.CreateMobileAppResult.MobileApplication.AppBaseId || '');

                            addAppVm.set('StoreCertificate.WindowsCertificate.PhoneProductId', addedApp.CreateMobileAppResult.PhoneProductId || '');

                            uploadFiles(addedApp.CreateMobileAppResult.MobileApplication);
                        },
                        error: function (errorMessage) {
                            AP.View.Waiting.hide();
                            AP.View.showMsg({
                                width: '700',
                                content: {
                                    template: AP.Utils.parseCommanErrorMessage(errorMessage)
                                }
                            });
                        }
                    });
                };
            }
            catch (e) {
                AP.View.showAlertKey('sections.addNewApp.messages.templateFailedToCreate');
            };

            return def.promise();
        },
        updateImageIdsEachStep = function (Args) {
            var AP = this.App,
                def = $.Deferred(),
                vm = AP.Config.loadQuery("CMAAddOrEditApp").get('Form.UploadImages');

            AP.Controller.route('action/AddEditApp/uploadImages', {
                ImagesData: vm,
                appId: Args.appId,
                success: function () {
                    def.resolve();
                }
            });

            return def.promise();
        },
        updateImageIds = function (Args) {
            var AP = this.App,
                def = $.Deferred(),
                vm = AP.Config.loadQuery(this.widget.QueryId).get('Form.UploadImages');

            AP.Controller.route('action/AddEditApp/uploadImages', {
                ImagesData: vm,
                appId: Args.appId,
                success: function () {
                    def.resolve();
                }
            });

            return def.promise();
        },
        updateCertificateIdsEachStep = function (Args) {
            var AP = this.App,
                def = $.Deferred(),
                vm = AP.Config.loadQuery('CMAAddOrEditApp').get('Form');

            AP.Controller.route('action/AddEditApp/uploadCertificates', {
                CertificateVm: vm.get('StoreCertificate'),
                appId: Args.appId,
                oldAppId: Args.oldAppId,
                success: function () {
                    def.resolve();
                }
            });

            return def.promise();
        },
        updateCertificateIds = function (Args) {
            var AP = this.App,
                def = $.Deferred(),
                vm = AP.Config.loadQuery(this.widget.QueryId).get('Form');

            AP.Controller.route('action/AddEditApp/uploadCertificates', {
                CertificateVm: vm.get('StoreCertificate'),
                appId: Args.appId,
                oldAppId: Args.oldAppId,
                success: function () {
                    def.resolve();
                }
            });

            return def.promise();
        },
        addApplicationToFilter = function (valueField) {
            var AP = this.App,
                dataStore = AP.Config.loadQuery('CMADataStore'),
                selectedAppList = AP.Config.loadQuery(this.widget.$Block.closest('.APWizardStep').data('APWidget')._config.QueryId).get('Form.ApplicationFilter.SelectedApps'),
                appName = dataStore.get('ApplicationName.' + valueField);

            if (appName && selectedAppList.indexOf(appName) == -1) {
                selectedAppList.push(appName);
                syncApplicationListOnServer.call(this, dataStore.get('ApplicationName.appList'), appName);
            };

            dataStore.set('ApplicationName.' + valueField, '');
        },
        syncApplicationListOnServer = function (list, newAppName) {
            var me = this, AP = me.App;

            if (!_.findWhere(list, { Value: newAppName })) {
                list.push({ Name: newAppName, Value: newAppName });

                AP.Controller.route('action/UserSettings/saveJsonList', {
                    FileName: 'ApplicationList_' + AP.Config.Data.UserData.Username.replace(/\\/g, '_'),
                    JsonString: JSON.stringify({ ApplicationList: list })
                });
            };
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
        buildEmailList = function (emailStr) {
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
            EmailListWidget: 'kendoMultiComboList',
            ImageMapper: {
                "Android_hdpi_Logo": "Android.HDPI.Logo",
                "Android_xhdpi_Logo": "Android.XHDPI.Logo",

                "Android_hdpi_Icon": "Android.HDPI.Icon",
                "Android_xxhdpi_Icon": "Android.XXHDPI.Icon",
                "Android_xhdpi_Icon": "Android.XHDPI.Icon",

                "Android_hdpi_Background": "Android.HDPI.Background",
                "Android_land-hdpi_Background": "Android.Land_HDPI.Background",
                "Android_xhdpi_Background": "Android.XHDPI.Background",
                "Android_land-xhdpi_Background": "Android.Land_XHDPI.Background",

                "iOS_Icon-iPhone@2x": "iOS.Icon",
                "iOS_Icon_iPad": "iOS.Icon_iPad",
                "iOS_SplashScreen": "iOS.SplashScreen",
                "iOS_SplashScreen_iPad": "iOS.SplashScreen_iPad",

                "Windows_Logo": "Windows.Logo",
                "Windows_Icon": "Windows.Icon",
                "Windows_BackGround": "Windows.Background",
                "Windows_SplashScreen": "Windows.SplashScreen",
            }
        };


    var newAppEventHandlers = {

        AddEditAppWizard: {
            stepchanging: function (Args) {
                debugger;
                var AP = this.App,
                    block = AP.Model.getBlock(Args.currentStep.BlockId)
                currentStepName = block.Widget.Name,
                    queryId = block.Widget.Config.QueryId,
                    nextStepName = Args.step.targetName,
                    vm = AP.Config.loadQuery(queryId),
                    $target = $(Args.e.currentTarget),
                    done = function () {
                        vm.Form[currentStepName].set('isActive', false);
                        vm.Form[nextStepName].set('isActive', true);
                        !$target.data('skip-validate') && vm.Form[currentStepName].set('isComplete', true);
                    }, formWidget = $target.closest('.APForm.APWidget').data('APWidget');


                Args.App = AP;
                Args.QueryId = formWidget.QueryId;
                if (!$target.data('skip-validate') && formWidget) {
                    debugger;
                    if (formWidget.Validator.validate()) {
                        if (customValidations[currentStepName]) {
                            customValidations[currentStepName].call(this, Args, vm.Form[currentStepName]).done(function () {

                                saveCurrentStep(Args);
                                Args.next();
                                done();
                            });
                        }
                        else {
                            saveCurrentStep(Args);
                            Args.next();
                            done();
                        };
                    };
                } else {
                    debugger;
                    saveCurrentStep(Args);
                    Args.next();
                    done();
                };
            }
        },

        DownloadPage: {
            init: function (Args) {
                var me = this,
                    AP = me.App,
                    vm = AP.Config.loadQuery('CMADownloadApp');

                AP.Controller.route('action/DownloadPage/getRoles', {
                    success: function (res) {
                        var multiselect = me.widget.$Block.find('[data-role=multiselect]').data('kendoMultiSelect');
                        multiselect && multiselect.setDataSource(res);
                    }
                });

                setTimeout(function () {
                    vm.set('Data.enableDownload', true);
                }, AP.Config.Data.ApplicationBuildTime * 60 * 1000);
            },
            downloadForAndroid: function () {
                utils.downloadDummyItem(this.App.Config.loadQuery('CMADownloadApp').get('Data.Name') + '.apk');
            },
            downloadForIos: function () {
                utils.downloadDummyItem(this.App.Config.loadQuery('CMADownloadApp').get('Data.Name') + '.ipa');
            },
            downloadForWindows: function () {
                utils.downloadDummyItem(this.App.Config.loadQuery('CMADownloadApp').get('Data.Name') + '.appx');
            },
            sendMail: function () {
                this.App.View.showAlert('Email successfully sent to above list.');
            }
        },

        PlatformSelectorForm: {
            ProceedNext: function (Args) {

                var AP = this.App,
                    addAppVm = AP.Config.loadQuery("CMAAddOrEditApp").get('Form'),
                    $tabStrip = this.widget.$Block.closest('.AddNewAppSteps').find('.UploadImages .ImageUploaderTabStrip'),
                    tabStrip = $tabStrip.getKendoTabStrip(),
                    $target = $(Args.e.currentTarget);

                if ($target.attr('disabled') == 'disabled') return false;

                tabStrip && (tabStrip.activateTab instanceof Function) && tabStrip.activateTab($tabStrip.find('.k-tabstrip-items .k-item.Available:first'));

                addAppVm.UploadImages.validate();

                if (addAppVm.get('PlatformSelector.CreateiPhoneAndiPadApp') || addAppVm.get('PlatformSelector.CreateWindowsPhoneApp') || addAppVm.get('PlatformSelector.CreateAndroidApp')) {
                    $target.siblings('[data-step-target=StoreCertificate]').click();
                }
                else {
                    $target.siblings('[data-step-target=UploadImages]').click();
                }
            }
        },

        ImageUploaderForm: {

            ProceedPrevious: function (Args) {

                var AP = this.App,
                    addAppVm = AP.Config.loadQuery(this.widget.QueryId).get('Form'),
                    $target = $(Args.e.currentTarget);

                if (addAppVm.get('PlatformSelector.CreateiPhoneAndiPadApp') || addAppVm.get('PlatformSelector.CreateWindowsPhoneApp') || addAppVm.get('PlatformSelector.CreateAndroidApp')) {
                    $target.siblings('[data-step-target=StoreCertificate]').click();
                }
                else {
                    $target.siblings('[data-step-target=PlatformSelector]').click();
                }
            },
            removeSelectedImage: function (Args) {
                var AP = this.App,
                    $target = $(Args.e.currentTarget),
                    imageFor = $target.data('image-for'),
                    queryId = AP.Model.getBlock(Args.BlockId).Widget.QueryId,
                    vm = AP.Config.loadQuery(queryId),
                    dataStore = AP.Config.loadQuery('CMADataStore'),
                    platform = $target.closest('.FormContainer').data('for');

                vm.set('Form.UploadImages.' + platform + '.' + imageFor + '.Content', dataStore.get('DefaultImages.' + platform + '.' + imageFor));
                vm.set('Form.UploadImages.' + platform + '.' + imageFor + '.Id', '');
                vm.set('Form.UploadImages.' + platform + '.' + imageFor + '.isDefaultImage', true);
                vm.Form.UploadImages.validate();
            }
        },
        ApplicationThemeSelector: {
            SetTheme: function (Args) {
                var currentTarget = $(Args.e.currentTarget),
                    selectedClass = 'Selected';

                currentTarget.is('.' + selectedClass) ? currentTarget.removeClass(selectedClass) : currentTarget.addClass(selectedClass);
            }
        },
        ApplicationFilterForm: {
            init: function (Args) {
                var me = this,
                    AP = this.App,
                    vm = AP.Config.loadQuery(this.widget.QueryId).get('Form');

                AP.Controller.route('action/AddEditApp/getApplicationFilterList', {
                    success: function (res) {
                        var data = null,
                            appList = null;

                        try {
                            appList = JSON.parse(res.TextData);
                            data = _.chain(appList).pluck('Value').unique().sort().map(function (value, key) {
                                return { Value: value, isChecked: false };
                            }).value();
                            vm.set('ApplicationFilter.dataSource', data);

                            vm.ApplicationFilter.updateStatus();
                        } catch (e) {

                        };

                    }

                });
                if (AP.Model.LoadDNAQueue[0].includes("addNewApp")) {
                    AP.Controller.route('action/UserSettings/getApplicationFilterList', {
                        success: function (res) {
                            var data = null,
                                appList = null;
                            try {
                                appList = JSON.parse(res.TextData);
                                vm.set('ApplicationFilter.dataSource', appList);
                            } catch (e) {
                                appList = [];
                            };

                        }
                    });
                }
            },
            ImportApplicationList: function () {
                var me = this,
                    AP = this.App,
                    vm = AP.Config.loadQuery('CMAUserSettings'),
                    fileContent = vm.get('Data.ApplicationList.Content'),
                    fileName = 'ApplicationList_' + AP.Config.Data.UserData.Username.replace(/\\/g, '_');

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
                                serverData = JSON.parse(res.TextData).ApplicationList;
                            } catch (e) {
                                serverData = [];
                            };

                            try {
                                fileData = JSON.parse(fileContent).ApplicationList;
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
                                JsonString: JSON.stringify({ ApplicationList: tempList }),
                                success: function (res) {
                                    AP.View.showAlertKey('List imported successfully.');
                                    var filterList = me.widget.$Block.closest('.APWizardStep').find('.ApplicationFilterList').data('APWidget'),
                                        fileUploader = me.widget.$Block.closest('.APWizardStep').find('.ImportControlField [data-role=filereader]').getKendofileReader();

                                    filterList && filterList.refresh && filterList.refresh();

                                    // Clear file and content.
                                    vm.set('Data.ApplicationList.Content', '');
                                    fileUploader && fileUploader._module.element.addClass('k-upload-empty').find('.k-upload-files').remove();

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
            ClearApplicationList: function () {
                var me = this,
                    AP = this.App,
                    vm = AP.Config.loadQuery(me.widget.QueryId).get('Form.ApplicationFilter');

                AP.View.confirmKey('Are you sure you want to remove application filter?', [{ text: 'Yes' }, { text: 'No' }]).Yes(function () {
                    AP.View.Waiting.show();
                    AP.Controller.route('action/UserSettings/deleteApplicationList', {
                        FileName: 'ApplicationList_' + AP.Config.Data.UserData.Username.replace(/\\/g, '_'),
                        success: function (res) {
                            res && AP.View.showAlertKey('Application filter removed successfully.');
                            //var filterList = me.widget.$Block.closest('.APWizardStep').find('.ApplicationFilterList').data('APWidget');

                            //filterList && filterList.refresh && filterList.refresh();

                            var fileUploader = me.widget.$Block.closest('.APWizardStep').find('.ImportControlField [data-role=filereader]').getKendofileReader();

                            AP.Config.loadQuery('CMAUserSettings').set('Data.ApplicationList.Content', '');
                            ClearApplicationList && fileUploader._module.element.addClass('k-upload-empty').find('.k-upload-files').remove();

                            vm.set('dataSource', []);
                            vm.set('SelectedApps', []);
                            vm.set('filterValue', 'no');
                            vm.set('canNavigate', true);

                            AP.View.Waiting.hide();
                        }
                    });
                });
            }
        },
        ApplicationFilterList: {
            init: function (Args) {
                this.widget.$Block.prepend($('<table class="ColumnHeaders"><tr><td>Show</td><td class="LeftAlign">NX Application</td></tr></table>'));
                var me = this,
                    AP = this.App,
                    vm = AP.Config.loadQuery(me.widget.QueryId).get('Form');

                if (AP.Model.LoadDNAQueue[0].includes("addNewApp")) {
                    AP.Controller.route('action/UserSettings/getApplicationFilterList', {
                        success: function (res) {
                            var data = null,
                                appList = null,
                                vm = AP.Config.loadQuery(me.widget.QueryId);

                            try {
                                appList = JSON.parse(res.TextData);
                            } catch (e) {
                                appList = [];
                            };
                            vm.set('Data.ApplicationList.dataSource', appList);
                        }
                    });

                    vmGlobalSettings = AP.Config.loadQuery("CMAUserSettings").get('Data.CompanyInfo');
                    vm.ApplicationSettings.CompanyName = vmGlobalSettings.CompanyName.Content;
                }
            },
            change: function (Args) {
                var AP = this.App,
                    vm = AP.Config.loadQuery(this.widget.$Block.closest('.APWizardStep').data('APWidget')._config.QueryId).get('Form.ApplicationFilter.SelectedApps'),
                    selectedItem = Args.selectedItem;

                if (selectedItem.isChecked) {
                    vm.push(selectedItem.Value);
                }
                else {
                    var index = _.indexOf(vm, selectedItem.Value);
                    (index > -1) && vm.splice(index, 1);
                };
            },
            databound: function (Args) {
                var me = this,
                    AP = me.App,
                    vm = AP.Config.loadQuery(me.widget.$Block.closest('.APWizardStep').data('APWidget')._config.QueryId).get('Form'),
                    temp, itemsToBePushed = [],
                    isDataModified = false,
                    listData = me.widget.getDataItems();

                $.each(vm.get('ApplicationFilter.SelectedApps'), function (idx, item) {
                    temp = _.findWhere(me.widget.KendoWidget.dataItems(), { Value: item });
                    if (temp) {
                        temp.hasOwnProperty('isChecked') && !temp.isChecked && (temp.isChecked = true, isDataModified = true);
                    }
                    else {
                        itemsToBePushed.push({
                            Value: item,
                            isChecked: true
                        });

                        isDataModified = true;
                    };
                });

                itemsToBePushed.length && me.widget.setData(itemsToBePushed);

                isDataModified && me.widget.KendoWidget.refresh();

                // Refresh scroll.
                AP.Utils.invokeAsync(function () {
                    me.widget.resizeScroll();
                });
            },

            command: function (Args) {
                var command = Args.command;
                commandHandlersForListView && command && commandHandlersForListView[command] && commandHandlersForListView[command].call(this, Args);
            }
        },
        IosCertificateForm: {
            init: function (args) {
                var me = this,
                    AP = this.App,
                    vm = AP.Config.loadQuery(this.widget.QueryId).get('Form');

                $.each(vm.get('StoreCertificate'), function (platform, certificateData) {
                    if (certificateData.Enabled) {
                        var fileReaderWidget = me.widget.$Block.find('.' + platform + ' > .k-upload .CertificateUploader, .' + platform + ' .AndroidCertificateHolder > .k-upload .CertificateUploader').getKendofileReader();

                        if (!fileReaderWidget) {
                            return;
                        };

                        var originalOnRemove = fileReaderWidget._module.onRemove,
                            dummyFileName = certificateData.CertificateFileName ? certificateData.CertificateFileName : (platform + (certificateData.contentType ? ('.' + certificateData.contentType) : ''));

                        fileReaderWidget._module.onRemove = function (e) {
                            if (e.target.data('dummy')) {
                                if (this.element.find('.k-upload-files .k-file').length > 1) {
                                    this.element.find('.k-upload-files .k-file:first').remove();
                                }
                                else {
                                    this.element.addClass('k-upload-empty').find('.k-upload-files').remove();
                                };
                            }
                            else {
                                originalOnRemove.apply(this, arguments);
                            };

                            vm.set('StoreCertificate.' + platform + '.Id', '');
                            vm.set('StoreCertificate.' + platform + '.Content', '');
                            vm.set('StoreCertificate.' + platform + '.Password', '');
                        };

                        if (vm.StoreCertificate[platform].Id) {
                            me.widget.$Block.find('.' + platform + ' > .k-widget.k-upload, .' + platform + ' .AndroidCertificateHolder > .k-widget.k-upload').removeClass('k-upload-empty').append('<ul class="k-upload-files k-reset"><li class="k-file" data-dummy="true"><span class="k-progress" style="width: 100%;"></span><span class="k-icon k-i-doc"></span><span class="k-filename" title="' + dummyFileName + '">' + dummyFileName + '</span><strong class="k-upload-status"><button type="button" class="k-button k-button-bare k-upload-action"><span class="k-icon k-i-close k-delete" title="Remove"></span></button></strong></li></ul>');
                        };
                    }
                });
            }
        },
        ApplicationSettingsForm: {

            init: function (args) {
                debugger;

                var me = this,
                    AP = this.App,
                    combobox = me.widget.$Block.find('.DefaultLocale[data-role=dropdownlist]').data('kendoDropDownList'),
                    vm = AP.Config.loadQuery(me.widget.QueryId).get('Form');

                if (AP.Model.LoadDNAQueue[0].includes("addNewApp")) {

                    AP.Controller.route('action/UserSettings/getCompanyDetails', {
                        success: function (res) {
                            var data = null,
                                appList = null,
                                vm = AP.Config.loadQuery(me.widget.QueryId);

                            try {
                                appList = JSON.parse(res.TextData);
                                vm.set('Form.ApplicationSettings.CompanyName', appList.CompanyName.Content);
                                vm.set('Form.ApplicationSettings.CompanyWebsite', appList.CompanyWebsite.Content);
                                vm.set('Form.ApplicationSettings.CompanySupportEmail', appList.CompanySupportEmail.Content);
                                vm.set('Form.ApplicationSettings.CompanyInfoEmail', appList.CompanyInfoEmail.Content);
                                vm.set('Form.ApplicationSettings.CopyrightInfo', appList.CopyrightInfo.Content);
                            } catch (e) {
                                appList = [];
                            };

                        }
                    });
                }
                require(['text!../../locales.xml'], function (localesXml) {
                    var formatter = function (v) {
                        return $.trim(v);
                    },
                        parser = new xmlParser(localesXml, {
                            root: 'Locales',
                            itemSelector: 'Locale',
                            nodes: {
                                Name: { selector: 'Name', format: formatter },
                                Value: { selector: 'Value', format: formatter }
                            }
                        }),
                        data = parser.parse();

                    combobox.dataSource.data(data);
                    !combobox.value() && data.length && vm.set('ApplicationSettings.DefaultLocale', data[0].Value);
                });
            }
        },
        AuthenticationConfigurationForm: {

            init: function (args) {

                var me = this,
                    AP = this.App,
                    vm = AP.Config.loadQuery(me.widget.QueryId).get('Form');

                if (AP.Model.LoadDNAQueue[0].includes("addNewApp")) {
                    AP.Controller.route('action/UserSettings/getAuthentication', {
                        success: function (res) {
                            var data = null,
                                appList = null,
                                vm = AP.Config.loadQuery(me.widget.QueryId);

                            try {
                                appList = JSON.parse(res.TextData);
                                vm.set('Form.AuthenticationConfiguration.ServerConfiguration.ProductionServerInstanceUrl', appList.AgilePointID.ServerInstanceURL.Content);
                                vm.set('Form.AuthenticationConfiguration.ActiveDirectoryConfiguration.Domain', appList.ActiveDirectory.Domain.Content);
                                vm.set('Form.AuthenticationConfiguration.SalesforceConfiguration.ConsumerKey', appList.SalesforceConfiguration.ConsumerKey.Content);
                                vm.set('Form.AuthenticationConfiguration.SalesforceConfiguration.ConsumerSecret', appList.SalesforceConfiguration.ConsumerSecret.Content);
                                vm.set('Form.AuthenticationConfiguration.OfficeConfiguration.ClientId', appList.WAADAndOfficeConfiguration.ClientID.Content);
                                vm.set('Form.AuthenticationConfiguration.OfficeConfiguration.Resource', appList.WAADAndOfficeConfiguration.ReturnURL.Content);
                                vm.set('Form.AuthenticationConfiguration.OfficeConfiguration.ReturnURL', appList.WAADAndOfficeConfiguration.Resource.Content);
                            } catch (e) {
                                appList = [];
                            };

                        }
                    });
                    //ImageUploaderForm
                    AP.Controller.route('action/UserSettings/getGlobalXML', {
                        success: function (res) {
                            try {
                                filesList = JSON.parse(res.TextData);
                                filesList = JSON.parse(filesList);
                                vmUploadImages = AP.Config.loadQuery('CMAAddOrEditApp').get('Form.UploadImages');
                                vmForIcon = null;
                                $.each(filesList, function (i, d) {
                                    Enum.ImageMapper[d.Name] && (vmForIcon = vmUploadImages.get(Enum.ImageMapper[d.Name]));

                                    vmForIcon && AP.Controller.route('action/UserSettings/getImageFile', {
                                        imgID: d.ID,
                                        vmUploadImages: vmForIcon,
                                    });
                                });

                            } catch (e) {
                                filesList = '';
                            };

                        }
                    });

                }

            }
        },
        NotificationListForm: {
            init: function () {
                var $emailList = this.widget.$Block.find('.EmailList');

                $emailList.niceScroll();
                $emailList.on('keyup', function (e) {
                    $emailList.getNiceScroll().resize();
                });

                var me = this,
                    AP = this.App,
                    vm = AP.Config.loadQuery("CMAUserSettings").get('Data');
                if (AP.Model.LoadDNAQueue[0].includes("addNewApp")) {
                    AP.Controller.route('action/UserSettings/getNotificationList', {
                        success: function (res) {
                            var data = null,
                                appList = null,
                                vm = AP.Config.loadQuery("CMAUserSettings").get('Data');

                            try {
                                debugger;
                                appList = JSON.parse(res.TextData);
                                vm.set('EmailList.value', appList);
                            } catch (e) {
                                appList = [];
                            };

                        }
                    });

                }
            },
            ClearEmailList: function (Args) {
                var me = this,
                    AP = this.App,
                    dataStoreVM = AP.Config.loadQuery('CMADataStore').get('ActiveAppMetaData'),
                    fileName = 'EmailList_' + dataStoreVM.AppBaseId;

                AP.View.confirmKey('Are you sure you want to clear notification list?', [{ text: 'Yes' }, { text: 'No' }]).Yes(function () {
                    AP.View.Waiting.show();
                    AP.Controller.route('action/UserSettings/deleteApplicationList', {
                        FileName: fileName,
                        success: function (res) {
                            res && AP.View.showAlertKey('Notification list cleared successfully.');
                            //var multiSelectWidget = me.widget.$Block.find(Enum.EmailListSelector).data(Enum.EmailListWidget);
                            //multiSelectWidget && (multiSelectWidget.dataSource.data([]));

                            var emailListVm = AP.Config.loadQuery('CMAUserSettings').get('Data.EmailList'),
                                fileUploader = me.widget.$Block.closest('.APWizardStep').find('.ImportControlField [data-role=filereader]').getKendofileReader();

                            fileUploader && fileUploader._module.element.addClass('k-upload-empty').find('.k-upload-files').remove();
                            emailListVm.set('value', '');
                            emailListVm.set('Content', '');
                            saveDistributionList.call(me, Args, true);

                            AP.View.Waiting.hide();
                        }
                    });
                });
            },
            SaveAsDraft: function (Args) {
                debugger;
                var me = this,
                    AP = me.App;
                addOrUpdateApplication.call(me, $.extend(Args, { statusCode: 0 }));
            },
            Publish: function (Args) {
                var me = this,
                    AP = me.App;

                addOrUpdateApplication.call(me, $.extend(Args, { statusCode: 1 })).done(function (vm) {
                    var dataVm = AP.Config.loadQuery('CMARequestForBuild').get('Data'),
                        selectedAppVm = vm.get('Form'),
                        controlsVm = vm.get('Controls'),
                        selectedPlatforms = [];

                    dataVm.set('Android.isAvailable', selectedAppVm.get('PlatformSelector.CreateAndroidApp'));
                    dataVm.set('iOS.isAvailable', selectedAppVm.get('PlatformSelector.CreateiPhoneAndiPadApp'));
                    dataVm.set('Windows.isAvailable', selectedAppVm.get('PlatformSelector.CreateWindowsPhoneApp'));

                    $.each(dataVm, function (key) {
                        if (this.isAvailable) {
                            selectedPlatforms.push(key);
                            controlsVm.set('Build.' + key + '.isBuildRequested', true);
                        };
                    });
                    AP.Controller.route('action/BuildApps/createMobileBuild', {
                        selectedPlatforms: selectedPlatforms,
                        selectedAppData: selectedAppVm,
                        success: function () {
                            if (arguments.length) {
                                var buildDataVm = AP.Config.loadQuery('CMAAddOrEditApp').get('Controls');

                                buildDataVm.set('isBuildRequestExists', true);

                                $.each(arguments, function () {
                                    var status = 'status_' + this.BuildStatus;

                                    if (this.BuildRequestId) {
                                        buildDataVm.set('Build.' + this.AppType + '.isBuildRequested', true);

                                        if (this.AppDownloadURL) {
                                            buildDataVm.set('Build.' + this.AppType + '.buildRequestId', this.BuildRequestId);
                                        }
                                        else {
                                            buildDataVm.set('Build.' + this.AppType + '.buildRequestId', '');
                                        };

                                        buildDataVm.set('Build.' + this.AppType + '.status', AP.View.Internationalize.translate('sections.editApp.appBuildStatus.' + status));
                                    };
                                });
                            };
                        }
                    });
                });
            }

        }
    };

    return newAppEventHandlers;
});