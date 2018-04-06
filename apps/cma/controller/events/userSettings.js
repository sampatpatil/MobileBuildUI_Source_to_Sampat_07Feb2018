define(function () {
    var importJsonSettings = function (config, Args) {
        var me = this,
            AP = this.App,
            vm = AP.Config.loadQuery('CMAUserSettings'),
            fileContent = vm.get('Data.' + config + '.Content'),
            fileName = 'ApplicationList_' + AP.Config.Data.UserData.Username;

        if (config != 'ApplicationList') {
            fileName = 'EmailList_' + AP.Config.Data.UserData.Username;
        };

        if (fileContent) {
            AP.Controller.route('action/UserSettings/saveJsonList', {
                FileName: fileName,
                JsonString: fileContent,
                success: function (res) {
                    AP.View.showAlertKey('List imported successfully.');
                }
            });
        }
        else {
            AP.View.showAlertKey('Please select a valid JSON file to import.')
        };
    },
        Enum = {
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
        },
        userSettingsHandlers = {

            UserSettings: {
                init: function (Args) {

                    var me = this,
                        AP = this.App;
                    vm = AP.Config.loadQuery(this.widget.QueryId);

                    AP.Controller.route('action/UserSettings/getCompanyDetails', {
                        success: function (res) {
                            var data = null,
                                appList = null,
                                vm = AP.Config.loadQuery(me.widget.QueryId);

                            try {
                                appList = JSON.parse(res.TextData);
                                vm.set('Data.CompanyInfo.CompanyName.Content', appList.CompanyName.Content);
                                vm.set('Data.CompanyInfo.CompanyWebsite.Content', appList.CompanyWebsite.Content);
                                vm.set('Data.CompanyInfo.CompanySupportEmail.Content', appList.CompanySupportEmail.Content);
                                vm.set('Data.CompanyInfo.CompanyInfoEmail.Content', appList.CompanyInfoEmail.Content);
                                vm.set('Data.CompanyInfo.CopyrightInfo.Content', appList.CopyrightInfo.Content);
                            } catch (e) {
                                appList = [];
                            };

                        }
                    });
                },
                saveUserSettings: function (Args) {
                    AP = this.App,
                        fileName = 'CompanyDetails_' + AP.Config.Data.UserData.Username.replace(/\\/g, '_');
                    AP.Controller.route('action/UserSettings/saveUserSettings', {
                        FileName: fileName,
                        JsonString: AP.Config.loadQuery('CMAUserSettings').get('Data.CompanyInfo'),
                        success: function (res) {
                            AP.View.showAlert('Data saved successfully.');
                        }
                    });
                },
                resetUserSettings: function (Args) {
                    AP = this.App;
                    AP.Config.loadQuery('CMAUserSettings').set('Data.CompanyInfo.CompanyName.Content', '');
                    AP.Config.loadQuery('CMAUserSettings').set('Data.CompanyInfo.CompanyWebsite.Content', '');
                    AP.Config.loadQuery('CMAUserSettings').set('Data.CompanyInfo.CompanySupportEmail.Content', '');
                    AP.Config.loadQuery('CMAUserSettings').set('Data.CompanyInfo.CompanyInfoEmail.Content', '');
                    AP.Config.loadQuery('CMAUserSettings').set('Data.CompanyInfo.CopyrightInfo.Content', '');
                },
                
            },
            Authentication: {
                init: function (Args) {
                    var me = this,
                        AP = this.App;
                    vm = AP.Config.loadQuery(this.widget.QueryId);

                    AP.Controller.route('action/UserSettings/getAuthentication', {
                        success: function (res) {
                            var data = null,
                                appList = null,
                                vm = AP.Config.loadQuery(me.widget.QueryId);

                            try {
                                appList = JSON.parse(res.TextData);
                                vm.set('Data.Authentication.AgilePointID.ServerInstanceURL.Content', appList.AgilePointID.ServerInstanceURL.Content);
                                vm.set('Data.Authentication.ActiveDirectory.Domain.Content', appList.ActiveDirectory.Domain.Content);
                                vm.set('Data.Authentication.SalesforceConfiguration.ConsumerKey.Content', appList.SalesforceConfiguration.ConsumerKey.Content);
                                vm.set('Data.Authentication.SalesforceConfiguration.ConsumerSecret.Content', appList.SalesforceConfiguration.ConsumerSecret.Content);
                                vm.set('Data.Authentication.WAADAndOfficeConfiguration.ClientID.Content', appList.WAADAndOfficeConfiguration.ClientID.Content);
                                vm.set('Data.Authentication.WAADAndOfficeConfiguration.ReturnURL.Content', appList.WAADAndOfficeConfiguration.ReturnURL.Content);
                                vm.set('Data.Authentication.WAADAndOfficeConfiguration.Resource.Content', appList.WAADAndOfficeConfiguration.Resource.Content);
                            } catch (e) {
                                appList = [];
                            };

                        }
                    });
                },
                saveAuthenticationSettings: function (Args) {
                    AP = this.App,
                        fileName = 'AuthenticationSettings_' + AP.Config.Data.UserData.Username.replace(/\\/g, '_');
                    AP.Controller.route('action/UserSettings/saveAuthenticationSettings', {
                        FileName: fileName,
                        JsonString: AP.Config.loadQuery('CMAUserSettings').get('Data.Authentication'),
                        success: function (res) {
                            AP.View.showAlert('Data saved successfully.');
                        }
                    });
                },
                restAuthenticationSettings: function (Args) {
                    AP = this.App;
                    AP.Config.loadQuery('CMAUserSettings').set('Data.Authentication.AgilePointID.ServerInstanceURL.Content', '');
                    AP.Config.loadQuery('CMAUserSettings').set('Data.Authentication.ActiveDirectory.Domain.Content', '');
                    AP.Config.loadQuery('CMAUserSettings').set('Data.Authentication.SalesforceConfiguration.ConsumerKey.Content', '');
                    AP.Config.loadQuery('CMAUserSettings').set('Data.Authentication.SalesforceConfiguration.ConsumerSecret.Content', '');
                    AP.Config.loadQuery('CMAUserSettings').set('Data.Authentication.WAADAndOfficeConfiguration.ClientID.Content', '');
                    AP.Config.loadQuery('CMAUserSettings').set('Data.Authentication.WAADAndOfficeConfiguration.ReturnURL.Content', '');
                    AP.Config.loadQuery('CMAUserSettings').set('Data.Authentication.WAADAndOfficeConfiguration.Resource.Content', '');
                    
                },
            },
            ApplicationList: {
                init: function (Args) {
                    var me = this,
                        AP = this.App;
                    vm = AP.Config.loadQuery(this.widget.QueryId);

                    AP.Controller.route('action/UserSettings/getApplicationFilterList', {
                        success: function (res) {
                            var data = null,
                                appList = null,
                                vm = AP.Config.loadQuery(me.widget.QueryId);

                            try {
                                appList = JSON.parse(res.TextData);
                                vm.set('Data.ApplicationList.dataSource', appList);
                            } catch (e) {
                                appList = [];
                            };

                        }
                    });
                },
                saveApplicationFilter: function (Args) {
                    AP = this.App,
                        fileName = 'ApplicationList_' + AP.Config.Data.UserData.Username.replace(/\\/g, '_')
                    AP.Controller.route('action/UserSettings/saveApplicationFilter', {
                        FileName: fileName,
                        JsonString: AP.Config.loadQuery('CMAUserSettings').get('Data.ApplicationList.dataSource'),
                        success: function (res) {
                            AP.View.showAlert('Data saved successfully.');
                        }
                    });
                },
                ClearApplicationList: function () {
                    debugger;
                    var me = this,
                        AP = this.App,
                        vm = AP.Config.loadQuery(me.widget.QueryId).get('Data.ApplicationFilter');
                    AP.View.confirmKey('Are you sure you want to remove application filter?', [{ text: 'Yes' }, { text: 'No' }]).Yes(function () {
                        AP.View.Waiting.show();
                        AP.Controller.route('action/UserSettings/deleteApplicationList', {
                            FileName: 'ApplicationList_' + AP.Config.Data.UserData.Username.replace(/\\/g, '_'),
                            success: function (res) {
                                res && AP.View.showAlertKey('Application filter removed successfully.');
                                $('.k-delete').click();
                                $('.ListItem').remove();
                                // var fileUploader = me.widget.$Block.find('.ImportControlField [data-role=filereader]').getKendofileReader();
                                //AP.Config.loadQuery('CMAUserSettings').set('Data.ApplicationList.dataSource', '');
                                // ClearApplicationList && fileUploader._module.element.addClass('k-upload-empty').find('.k-upload-files').remove();
                                //vm.set('dataSource', []);
                                //AP.Config.loadQuery('CMAUserSettings').set('Data.ApplicationList.dataSource', '');
                                //saveApplicationFilter();
                                // vm.set('SelectedApps', []);
                                // vm.set('filterValue', 'no');

                                // AP.View.Waiting.hide();
                            }
                        });
                    });
                }
            },
            NotificationList: {
                init: function (Args) {

                    var me = this,
                        AP = this.App;
                    vm = AP.Config.loadQuery(this.widget.QueryId);

                    AP.Controller.route('action/UserSettings/getNotificationList', {
                        success: function (res) {
                            var data = null,
                                appList = null,
                                vm = AP.Config.loadQuery(me.widget.QueryId);

                            try {
                                appList = JSON.parse(res.TextData);
                                vm.set('Data.EmailList.value', appList);
                            } catch (e) {
                                appList = [];
                            };


                        }
                    });
                },
                saveNotificationList: function (Args) {
                    AP = this.App,
                        fileName = 'NotificationList_' + AP.Config.Data.UserData.Username.replace(/\\/g, '_')
                    AP.Controller.route('action/UserSettings/saveNotificationList', {
                        FileName: fileName,
                        JsonString: AP.Config.loadQuery('CMAUserSettings').get('Data.EmailList.value'),
                        success: function (res) {
                            AP.View.showAlert('Data saved successfully.');
                        }
                    });
                },
            },
            UploadImage: {

                init: function (Args) {
                    filesList = null;
                    var me = this,
                        AP = this.App;
                    vm = AP.Config.loadQuery(this.widget.QueryId);

                    AP.Controller.route('action/UserSettings/getGlobalXML', {
                        success: function (res) {
                            try {
                                filesList = JSON.parse(res.TextData);
                                filesList = JSON.parse(filesList);
                                vmUploadImages = AP.Config.loadQuery('CMAUserSettings').get('Data.UploadImages');
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
                },
                saveUploadImages: function (Args) {
                    var me = this,
                        AP = this.App,
                        vm = AP.Config.loadQuery("CMAUserSettings").get('Data.UploadImages');
                    // var AP = this.App;
                    // vm = AP.Config.loadQuery("CMAUserSettings").get('Form.UploadImages');
                    // vmAndriod = vm.get('Form.UploadImages.Android');
                    // //HDPI
                    // vmWindows = vm.get('Form.UploadImages.Windows');
                    // vmiOS = vm.get('Form.UploadImages.iOS');
                    IDS = '';
                    AP.Controller.route('action/AddEditApp/uploadImages', {
                        appId: 'Global',
                        ImagesData: vm,
                        includeOnlyChangedItems: true,
                        success: function (res) {

                            var MainObj = [];
                            $.each(res, function (i, d) {
                                MainObj.push({ ID: d.IdName.split(',')[0], Name: d.IdName.split(',')[1] });

                            });

                            fileName = 'GlobalAppImages_' + AP.Config.Data.UserData.Username.replace(/\\/g, '_')
                            AP.Controller.route('action/UserSettings/saveUserSettings', {
                                FileName: fileName,
                                JsonString: JSON.stringify(MainObj),
                                success: function (res) {

                                }
                            });
                            AP.View.showAlert('Data saved successfully.');
                        }
                    });

                },
                resetUploadImages: function (Args) {
                    $('.RemoveSelectedFile').click();
                },
                resetActiveImages: function (Args) {
                    $('.k-state-active').find('.RemoveSelectedFile').click();
                },
                removeSelectedImage: function (Args) {
                    var AP = this.App,
                        $target = $(Args.e.currentTarget),
                        imageFor = $target.data('image-for'),
                        queryId = AP.Model.getBlock(Args.BlockId).Widget.QueryId,
                        vm = AP.Config.loadQuery(queryId),
                        dataStore = AP.Config.loadQuery('CMADataStore'),
                        platform = $target.closest('.FormContainer').data('for');

                    vm.set('Data.UploadImages.' + platform + '.' + imageFor + '.Content', dataStore.get('DefaultImages.' + platform + '.' + imageFor));
                    vm.set('Data.UploadImages.' + platform + '.' + imageFor + '.Id', '');
                    vm.set('Data.UploadImages.' + platform + '.' + imageFor + '.isDefaultImage', true);
                    //vm.Form.UploadImages.validate();
                }

            }
        };

    return userSettingsHandlers;

});