define(function () {
    var getImageData = function (vm, data) {
        var AP = this.App,
            def = $.Deferred();

        AP.Controller.route('action/AddEditApp/getImages', {
            ImagesData: vm.get('UploadImages'),
            data: data,
            success: function () {
                def.resolve();
            }
        });

        return def.promise();
    },
        getCertificates = function (vm) {
            var AP = this.App,
                def = $.Deferred();

            if (vm.get('NavigationPanel.isCertificateRequired').call(vm.get('NavigationPanel'))) {
                AP.Controller.route('action/AddEditApp/getCertificateFiles', {
                    CertificateVm: vm.get('StoreCertificate'),
                    success: function () {
                        def.resolve();
                    }
                });
            }
            else {
                def.resolve();
            };

            return def.promise();
        },
        getAppStatus = function (statusCode) {
            var appStatusList = ['Draft', 'Released', 'Retired'],
                appStatus = '';

            try {
                appStatus = appStatusList[statusCode]
            } catch (e) {
                appStatus = 'Retired'
            };

            return appStatus;
        },
        getVmDataFromXml = function (vm, data) {
            var AP = this.App,
                def = $.Deferred(),
                AuthTagMap = {
                    Salesforce: 'SalesforceConfiguration',
                    WAAD: 'OfficeConfiguration',
                    ActiveDirectory: 'ActiveDirectoryConfiguration',
                    AgilePointID: 'AgilePiontNXConfiguration'
                };

            try {
                var $xml = $($.parseXML(data.XmlData)),
                    formVM = vm.parent();

                if (data.XmlData) {
                    /* PlatformSelector details. */
                    vm.set('PlatformSelector.CreateAndroidApp', $xml.find('AppData MobileAppPlatform').attr('Android') == 'true');
                    vm.set('PlatformSelector.CreateiPhoneAndiPadApp', $xml.find('AppData MobileAppPlatform').attr('IOS') == 'true');
                    vm.set('PlatformSelector.CreateWindowsPhoneApp', $xml.find('AppData MobileAppPlatform').attr('Windows') == 'true');
                    vm.set('PlatformSelector.isComplete', true);
                    vm.set('PlatformSelector.canNavigate', true);

                    /* Set mobile build type. */
                    vm.set('PlatformSelector.iPhoneAndiPadBuildType', $xml.find('AppData IOSAppSettings MobileBuildType').text() || 'MDM');
                    vm.set('PlatformSelector.WindowsPhoneBuildType', $xml.find('AppData WindowsAppSettings MobileBuildType').text() || 'MDM');
                    vm.set('PlatformSelector.AndroidBuildType', $xml.find('AppData AndroidAppSettings MobileBuildType').text() || 'MDM');

                    if (formVM.hasOwnProperty('Controls')) {
                        vm.get('PlatformSelector.CreateAndroidApp') && formVM.set('Controls.Build.Android.status', AP.View.Internationalize.translate('sections.editApp.appBuildStatus.notRequested'));
                        vm.get('PlatformSelector.CreateiPhoneAndiPadApp') && formVM.set('Controls.Build.iOS.status', AP.View.Internationalize.translate('sections.editApp.appBuildStatus.notRequested'));
                        vm.get('PlatformSelector.CreateWindowsPhoneApp') && formVM.set('Controls.Build.Windows.status', AP.View.Internationalize.translate('sections.editApp.appBuildStatus.notRequested'));
                    };

                    /* Server url details. */
                    vm.set('AuthenticationConfiguration.ServerConfiguration.DevelopmentServerInstanceUrl', $xml.find('AppData MobileAppCommonSettings serverURLs serverURL[name=Development]').text());
                    vm.set('AuthenticationConfiguration.ServerConfiguration.StagingServerInstanceUrl', $xml.find('AppData MobileAppCommonSettings serverURLs serverURL[name=Staging]').text());
                    vm.set('AuthenticationConfiguration.ServerConfiguration.ProductionServerInstanceUrl', $xml.find('AppData MobileAppCommonSettings serverURLs serverURL[name=Production]').text());

                    /* SalesforceConfiguration details. */
                    vm.set('AuthenticationConfiguration.SalesforceConfiguration.ConsumerKey', $xml.find('AppData MobileAppCommonSettings AuthenticationProviders AuthProvider[Name=Salesforce]').attr('ClientId'));
                    vm.set('AuthenticationConfiguration.SalesforceConfiguration.ConsumerSecret', unescape($xml.find('AppData MobileAppCommonSettings AuthenticationProviders AuthProvider[Name=Salesforce]').attr('ReturnURL')));
                    vm.set('AuthenticationConfiguration.SalesforceConfiguration.isSelected', $xml.find('AppData MobileAppCommonSettings AuthenticationProviders AuthProvider[Name=Salesforce]').attr('Selected') == 'true');

                    /* OfficeConfiguration details. */
                    vm.set('AuthenticationConfiguration.OfficeConfiguration.ClientId', $xml.find('AppData MobileAppCommonSettings AuthenticationProviders AuthProvider[Name=WAAD]').attr('ClientId'));
                    vm.set('AuthenticationConfiguration.OfficeConfiguration.ReturnURL', unescape($xml.find('AppData MobileAppCommonSettings AuthenticationProviders AuthProvider[Name=WAAD]').attr('ReturnURL')));
                    vm.set('AuthenticationConfiguration.OfficeConfiguration.Resource', unescape($xml.find('AppData MobileAppCommonSettings AuthenticationProviders AuthProvider[Name=WAAD]').attr('Resource')));
                    vm.set('AuthenticationConfiguration.OfficeConfiguration.isSelected', $xml.find('AppData MobileAppCommonSettings AuthenticationProviders AuthProvider[Name=WAAD]').attr('Selected') == 'true');

                    /* ActiveDirectoryConfiguration details. */
                    vm.set('AuthenticationConfiguration.ActiveDirectoryConfiguration.Domain', $xml.find('AppData MobileAppCommonSettings AuthenticationProviders AuthProvider[Name=ActiveDirectory]').attr('Domain'));
                    vm.set('AuthenticationConfiguration.ActiveDirectoryConfiguration.isSelected', $xml.find('AppData MobileAppCommonSettings AuthenticationProviders AuthProvider[Name=ActiveDirectory]').attr('Selected') == 'true');

                    /* AgilePiontNXConfiguration details. */
                    vm.set('AuthenticationConfiguration.AgilePiontNXConfiguration.isSelected', $xml.find('AppData MobileAppCommonSettings AuthenticationProviders AuthProvider[Name=AgilePointID]').attr('Selected') == 'true');

                    /* Default Auth Configuration. */
                    var defaultConfigName = $xml.find('AppData MobileAppCommonSettings AuthenticationProviders AuthProvider[Default=true]').attr('Name');
                    defaultConfigName && vm.set('AuthenticationConfiguration.defaultConfig', AuthTagMap[defaultConfigName]);

                    vm.set('AuthenticationConfiguration.isComplete', true);

                    /* ApplicationSettings details. */
                    vm.set('ApplicationSettings.Name', data.AppDisplayName);
                    vm.set('ApplicationSettings.Description', data.AppDescription);
                    vm.set('ApplicationSettings.CompanyName', data.AppCompanyName);
                    vm.set('ApplicationSettings.CompanyWebsite', data.AppCompanyWebsite);
                    vm.set('ApplicationSettings.DefaultLocale', $xml.find('AppData MobileAppCommonSettings DefaultLocale').text());
                    vm.set('ApplicationSettings.CopyrightInfo', $xml.find('AppData MobileAppCommonSettings CopyRightInfo').text());
                    vm.set('ApplicationSettings.appId', data.AppId);
                    vm.set('ApplicationSettings.appBaseId', data.AppBaseId);
                    vm.set('ApplicationSettings.createdDate', data.AppCreatedDate);
                    vm.set('ApplicationSettings.distributionList', data.AppDistributionList);
                    vm.set('ApplicationSettings.AppStatus', getAppStatus(data.AppStatus));
                    vm.set('ApplicationSettings.AppVersion', $xml.find('AppData MobileAppCommonSettings MobileAppVersion').text());
                    vm.set('ApplicationSettings.CompanySupportEmail', $xml.find('AppData MobileAppCommonSettings CompanySupportEmail').text());
                    vm.set('ApplicationSettings.CompanyInfoEmail', $xml.find('AppData MobileAppCommonSettings CompanyInfoEmail').text());
                    vm.set('ApplicationSettings.appLogoId', data.AppLogo);
                    vm.set('ApplicationSettings.isComplete', true);

                    /* Android image details. */
                    vm.set('UploadImages.Android.XXHDPI.Icon.Id', $xml.find('AppData AndroidAppSettings MobileAppImages xxhdpi IconFile').text());
                    vm.set('UploadImages.Android.XXHDPI.Logo.Id', $xml.find('AppData AndroidAppSettings MobileAppImages xxhdpi Logo').text());
                    vm.set('UploadImages.Android.XXHDPI.Background.Id', $xml.find('AppData AndroidAppSettings MobileAppImages xxhdpi BackgroundImage').text());
                    vm.set('UploadImages.Android.XXHDPI.StoreLogo.Id', $xml.find('AppData AndroidAppSettings MobileAppImages xxhdpi StoreLogo').text());

                    vm.set('UploadImages.Android.XHDPI.Icon.Id', $xml.find('AppData AndroidAppSettings MobileAppImages xhdpi IconFile').text());
                    vm.set('UploadImages.Android.XHDPI.Logo.Id', $xml.find('AppData AndroidAppSettings MobileAppImages xhdpi Logo').text());
                    vm.set('UploadImages.Android.XHDPI.Background.Id', $xml.find('AppData AndroidAppSettings MobileAppImages xhdpi BackgroundImage').text());
                    vm.set('UploadImages.Android.XHDPI.StoreLogo.Id', $xml.find('AppData AndroidAppSettings MobileAppImages xhdpi StoreLogo').text());

                    vm.set('UploadImages.Android.HDPI.Icon.Id', $xml.find('AppData AndroidAppSettings MobileAppImages hdpi IconFile').text());
                    vm.set('UploadImages.Android.HDPI.Logo.Id', $xml.find('AppData AndroidAppSettings MobileAppImages hdpi Logo').text());
                    vm.set('UploadImages.Android.HDPI.Background.Id', $xml.find('AppData AndroidAppSettings MobileAppImages hdpi BackgroundImage').text());
                    vm.set('UploadImages.Android.HDPI.StoreLogo.Id', $xml.find('AppData AndroidAppSettings MobileAppImages hdpi StoreLogo').text());

                    vm.set('UploadImages.Android.Land_HDPI.Icon.Id', $xml.find('AppData AndroidAppSettings MobileAppImages land-hdpi IconFile').text());
                    vm.set('UploadImages.Android.Land_HDPI.Logo.Id', $xml.find('AppData AndroidAppSettings MobileAppImages land-hdpi Logo').text());
                    vm.set('UploadImages.Android.Land_HDPI.Background.Id', $xml.find('AppData AndroidAppSettings MobileAppImages land-hdpi BackgroundImage').text());
                    vm.set('UploadImages.Android.Land_HDPI.StoreLogo.Id', $xml.find('AppData AndroidAppSettings MobileAppImages land-hdpi StoreLogo').text());

                    vm.set('UploadImages.Android.Land_XHDPI.Icon.Id', $xml.find('AppData AndroidAppSettings MobileAppImages land-xhdpi IconFile').text());
                    vm.set('UploadImages.Android.Land_XHDPI.Logo.Id', $xml.find('AppData AndroidAppSettings MobileAppImages land-xhdpi Logo').text());
                    vm.set('UploadImages.Android.Land_XHDPI.Background.Id', $xml.find('AppData AndroidAppSettings MobileAppImages land-xhdpi BackgroundImage').text());
                    vm.set('UploadImages.Android.Land_XHDPI.StoreLogo.Id', $xml.find('AppData AndroidAppSettings MobileAppImages land-xhdpi StoreLogo').text());

                    /* iOS image details. */
                    vm.set('UploadImages.iOS.Icon.Id', $xml.find('AppData IOSAppSettings MobileAppImages RetinaDisplay IconFile').text());
                    vm.set('UploadImages.iOS.Icon_iPad.Id', $xml.find('AppData IOSAppSettings MobileAppImages RetinaDisplay IconFile_iPad').text());
                    vm.set('UploadImages.iOS.Logo.Id', $xml.find('AppData IOSAppSettings MobileAppImages RetinaDisplay Logo').text());
                    vm.set('UploadImages.iOS.SplashScreen.Id', $xml.find('AppData IOSAppSettings MobileAppImages RetinaDisplay SplashScreenImage').text());
                    vm.set('UploadImages.iOS.SplashScreen_iPad.Id', $xml.find('AppData IOSAppSettings MobileAppImages RetinaDisplay SplashScreen_iPad').text());
                    vm.set('UploadImages.iOS.StoreLogo.Id', $xml.find('AppData IOSAppSettings MobileAppImages RetinaDisplay StoreLogo').text());

                    /* Windows image details. */
                    vm.set('UploadImages.Windows.Icon.Id', $xml.find('AppData WindowsAppSettings MobileAppImages IconFile').text());
                    vm.set('UploadImages.Windows.Logo.Id', $xml.find('AppData WindowsAppSettings MobileAppImages Logo').text());
                    vm.set('UploadImages.Windows.SplashScreen.Id', $xml.find('AppData WindowsAppSettings MobileAppImages SplashScreenImage').text());
                    vm.set('UploadImages.Windows.Background.Id', $xml.find('AppData WindowsAppSettings MobileAppImages BackgroundImage').text());

                    vm.set('UploadImages.isComplete', true);

                    /* ApplicationFilter details. */
                    vm.set('ApplicationFilter.filterValue', $xml.find('AppData MobileAppCommonSettings ApplicationFilters').attr('Enabled') == 'true' ? 'yes' : 'no');
                    $xml.find('AppData MobileAppCommonSettings ApplicationFilters Filter').each(function () {
                        vm.get('ApplicationFilter.SelectedApps').push(this.textContent);
                    });
                    vm.set('ApplicationFilter.isComplete', true);

                    var menuList = vm.get('AppMenu.Options');
                    /* AppMenu details. */
                    $xml.find('AppData MobileAppCommonSettings MobileAppMenu Menu').each(function () {
                        var $menuNode = $(this),
                            name = $menuNode.attr('Name'),
                            value = $menuNode.attr('DisplayName'),
                            isEnabled = $menuNode.attr('Enabled') == 'true',
                            currentItem = _.findWhere(menuList, { Name: name });

                        if (currentItem) {
                            currentItem.set('Name', name);
                            currentItem.set('Value', value);
                            currentItem.set('isEnabled', isEnabled);
                        }
                        //else {
                        //    menuList.push({
                        //        "Name": name,
                        //        "Value": value,
                        //        "isEnabled": isEnabled
                        //    });
                        //};
                    });
                    vm.set('AppMenu.isComplete', true);


                    /* Application theme details. */
                    $.each(vm.ApplicationThemes, function (idx, item) {
                        if (item.hasOwnProperty('isSelected')) {
                            item.set('isSelected', false);
                        };
                    });

                    var selectedTheme = $xml.find('AppData WindowsAppSettings ApplicationTheme').attr('ThemeName');
                    vm.set('ApplicationThemes.' + selectedTheme + '.isSelected', true);
                    vm.set('ApplicationThemes.previewImage', $xml.find('AppData WindowsAppSettings ApplicationTheme').attr('ThemeName'));
                    vm.set('ApplicationThemes.backgroundColorCode', $xml.find('AppData WindowsAppSettings ApplicationTheme').attr('AppBackgroundColor'));
                    vm.set('ApplicationThemes.menuColorCode', $xml.find('AppData WindowsAppSettings ApplicationTheme').attr('MenuBackgroundColor'));
                    vm.set('ApplicationThemes.buttonColorCode', $xml.find('AppData WindowsAppSettings ApplicationTheme').attr('ButtonColor'));
                    vm.set('ApplicationThemes.isComplete', true);

                    /* IosCertificate details. */
                    vm.set('StoreCertificate.IosCertificate.Id', $xml.find('AppData IOSAppSettings StoreCertificate CertificateFile').text());
                    vm.set('StoreCertificate.IosCertificate.Password', $xml.find('AppData IOSAppSettings StoreCertificate Password').text());
                    vm.set('StoreCertificate.IosCertificate.CertificateFileName', $xml.find('AppData IOSAppSettings StoreCertificate CertificateFileName').text());
                    vm.set('StoreCertificate.ProvisioningProfile.Id', $xml.find('AppData IOSAppSettings StoreCertificate ProvisioningProfile').text());
                    vm.set('StoreCertificate.ProvisioningProfile.CertificateFileName', $xml.find('AppData IOSAppSettings StoreCertificate ProvisioningProfileCertificateFileName').text());
                    //vm.set('StoreCertificate.ProvisioningProfile.ProvisioningProfileUUID', $xml.find('AppData IOSAppSettings StoreCertificate ProvisioningProfileUUID').text());
                    //vm.set('StoreCertificate.ProvisioningProfile.AppBundleIdentifier', $xml.find('AppData IOSAppSettings StoreCertificate AppBundleIdentifier').text());

                    /* WindowsCertificate details. */
                    vm.set('StoreCertificate.WindowsCertificate.Id', $xml.find('AppData WindowsAppSettings StoreCertificate CertificateFile').text());
                    vm.set('StoreCertificate.WindowsCertificate.Password', $xml.find('AppData WindowsAppSettings StoreCertificate Password').text());
                    vm.set('StoreCertificate.WindowsCertificate.CertificateFileName', $xml.find('AppData WindowsAppSettings StoreCertificate CertificateFileName').text());

                    /* Windows publisher details. */
                    vm.set('StoreCertificate.WindowsCertificate.PublisherId', $xml.find('AppData WindowsAppSettings PublisherId').text());
                    vm.set('StoreCertificate.WindowsCertificate.PhonePublisherId', $xml.find('AppData WindowsAppSettings PhonePublisherId').text());
                    vm.set('StoreCertificate.WindowsCertificate.PhoneProductId', $xml.find('AppData WindowsAppSettings PhoneProductId').text());

                    /* AndroidCertificate details. */
                    vm.set('StoreCertificate.AndroidCertificate.Id', $xml.find('AppData AndroidAppSettings StoreCertificate CertificateFile').text());
                    vm.set('StoreCertificate.AndroidCertificate.CertificateFileName', $xml.find('AppData AndroidAppSettings StoreCertificate CertificateFileName').text());
                    vm.set('StoreCertificate.AndroidCertificate.storePassword', $xml.find('AppData AndroidAppSettings StoreCertificate storePassword').text());
                    vm.set('StoreCertificate.AndroidCertificate.keyAlias', $xml.find('AppData AndroidAppSettings StoreCertificate keyAlias').text());
                    vm.set('StoreCertificate.AndroidCertificate.keyPassword', $xml.find('AppData AndroidAppSettings StoreCertificate keyPassword').text());
                    vm.set('StoreCertificate.AndroidCertificate.UseCustomCert', $xml.find('AppData AndroidAppSettings StoreCertificate').attr('UseCustomCert') == 'true');
                    vm.set('StoreCertificate.AndroidCertificate.PackageName', $xml.find('AppData AndroidAppSettings PackageName').text());
                    vm.set('StoreCertificate.isComplete', true);

                    vm.set('NotificationList.isComplete', true);

                    $.when(getImageData.call(this, vm, data), getCertificates.call(this, vm)).done(function () {
                        def.resolve();
                    }).fail(def.reject);
                }
                else {
                    def.reject();
                };
            } catch (err) {
                def.reject(err);
                throw err;
            };

            return def.promise();
        };
    var downloadPage = {
        getRoles: function (Args) {
            var AP = Args.AP;
            AP.Config.AjaxRequest({
                QueryMethod: 'admin/getroles',
                QueryType: 'GET',
                usePortalUrl: true
            }, {
                success: function (e) {
                    Args.success(e.GetRolesResult);
                },
                error: function (e) {
                    Args.error && Args.error(e);
                }
            });
        },
        loadXmlEachStep: function (Args) {
            var me = this,
                AP = Args.AP,
                stopNavigation = Args.stopNavigation || false; //flag to stop navigation to appDetails; If set to true, then we don't navigate further. This is used for loading APP XML for Build functionality on My Apps page -- Phani

            AP.Controller.route('action/AddEditApp/getXmlFile', {
                appId: Args.selectedItem.AppId,
                success: function (response) {
                    response.TextData && (Args.selectedItem.XmlData = response.TextData);
                    getVmDataFromXml.call({ App: AP }, Args.vm.get('Form'), Args.selectedItem).done(function () {
                        if(!stopNavigation) AP.Controller.route('action/BuildApps/loadBuildStatus', {
                            vm: Args.vm,
                            success: function (res) {

                                Args.success && Args.success(Args.vm);

                                //AP.Controller.route(kendo.format('go/sections/myApps/appDetailsAndDownload/params({0})', Args.selectedItem.AppId), Args);
                            }
                        });
                    }).fail(function () {
                        AP.View.showAlertKey('Unable to read settings file.');
                        Args.error && Args.error.apply(this, arguments);
                    });
                },
                error: function () {
                    AP.View.showAlertKey('Unable to read settings file.');
                    Args.error && Args.error.apply(this, arguments);
                }
            });
        },
        loadXml: function (Args) {
            var me = this,
                AP = Args.AP,
                stopNavigation = Args.stopNavigation || false; //flag to stop navigation to appDetails; If set to true, then we don't navigate further. This is used for loading APP XML for Build functionality on My Apps page -- Phani

            AP.Controller.route('action/AddEditApp/getXmlFile', {
                appId: Args.selectedItem.AppId,
                success: function (response) {
                    response.TextData && (Args.selectedItem.XmlData = response.TextData);
                    getVmDataFromXml.call({ App: AP }, Args.vm.get('Form'), Args.selectedItem).done(function () {
                        if(!stopNavigation) AP.Controller.route('action/BuildApps/loadBuildStatus', {
                            vm: Args.vm,
                            success: function (res) {

                                Args.success && Args.success(Args.vm);

                                AP.Controller.route(kendo.format('go/sections/myApps/appDetailsAndDownload/params({0})', Args.selectedItem.AppId), Args);
                            }
                        });
                    }).fail(function () {
                        AP.View.showAlertKey('Unable to read settings file.');
                        Args.error && Args.error.apply(this, arguments);
                    });
                },
                error: function () {
                    AP.View.showAlertKey('Unable to read settings file.');
                    Args.error && Args.error.apply(this, arguments);
                }
            });
        },
        downloadApplication: function (Args) {
            var me = this,
                AP = Args.AP;

            AP.Config.customAjaxRequest({
                QueryMethod: 'DownloadMobilePackage/' + Args.buildRequestId,
                QueryType: 'GET',
                contentType: 'blob'
            }, {
                success: function (e) {
                    AP.Utils.downloadBlob(e, Args.fileName);
                    Args.success && Args.success(e);
                },
                error: function (e) {
                    if (Args.error) {
                        Args.error(e);
                        return true;
                    };

                    var fileReader = new FileReader();

                    AP.View.Waiting.hide();

                    fileReader.onload = function (e) {
                        AP.View.showMsg({
                            width:'700',
                            content: {
                                template: AP.Utils.parseCommanErrorMessage(e.target.result)
                            }
                        });
                    };

                    fileReader.readAsText(e);
                }
            });
        },
        getBuildRequestDetails: function (Args) {
            var me = this,
                AP = Args.AP,
                urlTemplate = 'GetBuildRequestByStatusOrBuildReqID?BuildId={0}&status={1}&';

            AP.Config.AjaxRequest({
                QueryMethod: kendo.format(urlTemplate, Args.buildRequestId, 'All'),
                QueryType: 'GET',
            }, {
                success: function (e) {
                    Args.success && Args.success(e.length ? e[0] : {});
                },
                error: function (e) {
                    if (Args.error) {
                        Args.error(e);
                        return true;
                    };
                }
            });
        }
    }

    return downloadPage;
});