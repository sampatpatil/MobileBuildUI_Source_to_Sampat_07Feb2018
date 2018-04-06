define([], function () {
    var Id = 'CMAAddOrEditApp',
        EnumProvisioningProfileHelpText = {
            mdm: 'Production/Distribution Provisioning profile of Apple VPP/Enterprise Program.',
            store: 'Distribution Provisioning profile of Apple Developer Program.',
            device: 'Development Provisioning profile of Apple Developer Program.'
        },
        EnumIosCertificateHelpText = {
            mdm: 'Production/Distribution certificate of Apple VPP/Enterprise Program.',
            store: 'Production/Distribution or .p12 certificate of Apple Developer Program.',
            device: 'Development or .p12 certificate of Apple Developer Program.'
        };

    // Query to add a customized app. This query will be changed. It is used only for testing purpose.
    var AddEditApp = {
        Id: Id,
        vm: function (AP) {
            var dataStore = AP.Config.loadQuery('CMADataStore');
            return {
                Id: Id,
                QueryMethod: '',
                QueryType: '',
                QueryJsonData: '',
                generateQuery: function () {

                },
                //// Method to clear form data.
                clear: function () {
                },
                Form: {
                    PlatformSelector: {
                        CreateAndroidApp: false,
                        CreateiPhoneAndiPadApp: false,
                        CreateWindowsPhoneApp: false,
                        iPhoneAndiPadBuildType: 'MDM',
                        WindowsPhoneBuildType: 'MDM',
                        AndroidBuildType: 'MDM',
                        isActive: false,
                        isComplete: false,
                        change: function (e) {
                            var vm = AP.Config.loadQuery(Id).get('Form.PlatformSelector'),
                                name = $(e.currentTarget).find('.AltCheckbox').data('name');
                            name && vm.set(name, !vm.get(name));
                            vm.set('canNavigate', (vm.CreateAndroidApp || vm.CreateiPhoneAndiPadApp || vm.CreateWindowsPhoneApp));
                            !vm.CreateAndroidApp && vm.parent().set('StoreCertificate.AndroidCertificate.UseCustomCert', false);
                        },
                        canNavigate: false
                    },
                    AuthenticationConfiguration: {
                        ServerConfiguration: {
                            DevelopmentServerInstanceUrl: '',
                            StagingServerInstanceUrl: '',
                            ProductionServerInstanceUrl: ''
                        },
                        SalesforceConfiguration: {
                            ConsumerKey: '',
                            ConsumerSecret: '',
                            isSelected: false
                        },
                        OfficeConfiguration: {
                            ClientId: '',
                            ReturnURL: '',
                            Resource: '',
                            isSelected: false
                        },
                        ActiveDirectoryConfiguration: {
                            Domain: '',
                            isSelected: false
                        },
                        AgilePiontNXConfiguration: {
                            isSelected: true
                        },
                        defaultConfig: 'AgilePiontNXConfiguration',
                        changeSelection: function (e) {
                            var vm = AP.Config.loadQuery(Id).get('Form.AuthenticationConfiguration'),
                                name = $(e.currentTarget).data('name');

                            if (!name) return;
                            vm[name].set('isSelected', !vm[name].get('isSelected'));
                        },
                        changeDefault: function (e) {
                            var vm = AP.Config.loadQuery(Id).get('Form.AuthenticationConfiguration'),
                                name = $(e.currentTarget).val();

                            name && vm.set('defaultConfig', name);
                        },
                        isActive: false,
                        isComplete: false,
                        canNavigate: false,
                        errorMessage: ''
                    },
                    ApplicationSettings: {
                        Name: '',
                        Description: '',
                        CompanyName: '',
                        CompanyWebsite: '',
                        DefaultLocale: '',
                        CopyrightInfo: '',
                        appId: '',
                        createdDate: '',
                        AppVersion: '',
                        CompanySupportEmail: '',
                        CompanyInfoEmail: '',
                        distributionList: '',
                        appLogoId: '',
                        isActive: true,
                        isComplete: false,
                        canNavigate: true,
                        onblur: function (e) {
                            var vm = AP.Config.loadQuery(Id).get('Form.ApplicationSettings'),
                                formWidget = $(e.currentTarget).closest('.APForm.APWidget').data('APWidget');
                            if (!formWidget) return;
                            vm.set('canNavigate', formWidget.Validator.validate());
                        }
                    },
                    UploadImages: {
                        Android: {
                            HDPI: {
                                Logo: {
                                    Id: '',
                                    showLabel: true,
                                    defaultValue: "",
                                    size: 8,
                                    type: 'filereader',
                                    Enabled: true,
                                    Content: dataStore.get('DefaultImages.Android.HDPI.Logo'),
                                    imageSize: '550 x 75',
                                    config: {
                                        type: '.png',
                                        readFileAs: 'readAsDataURL',
                                        width: 550,
                                        height: 75
                                    },
                                    required: false,
                                    isDefaultImage: true
                                },
                                Icon: {
                                    Id: '',
                                    showLabel: true,
                                    defaultValue: "",
                                    size: 8,
                                    type: 'filereader',
                                    Enabled: true,
                                    Content: dataStore.get('DefaultImages.Android.HDPI.Icon'),
                                    imageSize: '72 x 72',
                                    config: {
                                        type: '.png',
                                        readFileAs: 'readAsDataURL',
                                        width: 72,
                                        height: 72
                                    },
                                    required: false,
                                    isDefaultImage: true
                                },
                                Background: {
                                    Id: '',
                                    showLabel: false,
                                    defaultValue: "",
                                    size: 8,
                                    type: 'filereader',
                                    Enabled: true,
                                    Content: dataStore.get('DefaultImages.Android.HDPI.Background'),
                                    imageSize: '578 x 962',
                                    config: {
                                        type: '.png',
                                        readFileAs: 'readAsDataURL',
                                        width: 578,
                                        height: 962
                                    },
                                    required: false,
                                    isDefaultImage: true
                                },
                                SplashScreen: {
                                    Id: '',
                                    showLabel: true,
                                    defaultValue: "",
                                    size: 8,
                                    type: 'filereader',
                                    Enabled: false,
                                    Content: dataStore.get('DefaultImages.Android.HDPI.SplashScreen'),
                                    imageSize: '578 x 962',
                                    config: {
                                        type: '.png',
                                        readFileAs: 'readAsDataURL',
                                        width: 578,
                                        height: 962
                                    },
                                    required: false,
                                    isDefaultImage: true
                                },
                                StoreLogo: {
                                    Id: '',
                                    showLabel: true,
                                    defaultValue: "",
                                    size: 8,
                                    type: 'filereader',
                                    Enabled: false,
                                    Content: dataStore.get('DefaultImages.Android.HDPI.StoreLogo'),
                                    imageSize: '120 x 120',
                                    config: {
                                        type: '.png',
                                        readFileAs: 'readAsDataURL',
                                        width: 120,
                                        height: 120
                                    },
                                    required: false,
                                    isDefaultImage: true
                                },
                            },
                            Land_HDPI: {
                                Logo: {
                                    Id: '',
                                    showLabel: true,
                                    defaultValue: "",
                                    size: 8,
                                    type: 'filereader',
                                    Enabled: false,
                                    Content: dataStore.get('DefaultImages.Android.Land_HDPI.Logo'),
                                    imageSize: '345 x 87',
                                    config: {
                                        type: '.png',
                                        readFileAs: 'readAsDataURL',
                                        width: 345,
                                        height: 87
                                    },
                                    required: false,
                                    isDefaultImage: true
                                },
                                Icon: {
                                    Id: '',
                                    showLabel: true,
                                    defaultValue: "",
                                    size: 8,
                                    type: 'filereader',
                                    Enabled: false,
                                    Content: dataStore.get('DefaultImages.Android.Land_HDPI.Icon'),
                                    imageSize: '160 x 160',
                                    config: {
                                        type: '.png',
                                        readFileAs: 'readAsDataURL',
                                        width: 160,
                                        height: 160
                                    },
                                    required: false,
                                    isDefaultImage: true
                                },
                                Background: {
                                    Id: '',
                                    showLabel: true,
                                    defaultValue: "",
                                    size: 8,
                                    type: 'filereader',
                                    Enabled: true,
                                    Content: dataStore.get('DefaultImages.Android.Land_HDPI.Background'),
                                    imageSize: '962 x 578',
                                    config: {
                                        type: '.png',
                                        readFileAs: 'readAsDataURL',
                                        width: 962,
                                        height: 578
                                    },
                                    required: false,
                                    isDefaultImage: true
                                },
                                SplashScreen: {
                                    Id: '',
                                    showLabel: true,
                                    defaultValue: "",
                                    size: 8,
                                    type: 'filereader',
                                    Enabled: false,
                                    Content: dataStore.get('DefaultImages.Android.Land_HDPI.SplashScreen'),
                                    imageSize: '578 x 962',
                                    config: {
                                        type: '.png',
                                        readFileAs: 'readAsDataURL',
                                        width: 578,
                                        height: 962
                                    },
                                    required: false,
                                    isDefaultImage: true
                                },
                                StoreLogo: {
                                    Id: '',
                                    showLabel: true,
                                    defaultValue: "",
                                    size: 8,
                                    type: 'filereader',
                                    Enabled: false,
                                    Content: dataStore.get('DefaultImages.Android.Land_HDPI.StoreLogo'),
                                    imageSize: '120 x 120',
                                    config: {
                                        type: '.png',
                                        readFileAs: 'readAsDataURL',
                                        width: 120,
                                        height: 120
                                    },
                                    required: false,
                                    isDefaultImage: true
                                },
                            },
                            XXHDPI: {
                                Logo: {
                                    Id: '',
                                    showLabel: true,
                                    defaultValue: "",
                                    size: 8,
                                    type: 'filereader',
                                    Enabled: false,
                                    Content: dataStore.get('DefaultImages.Android.XXHDPI.Logo'),
                                    imageSize: '345 x 87',
                                    config: {
                                        type: '.png',
                                        readFileAs: 'readAsDataURL',
                                        width: 345,
                                        height: 87
                                    },
                                    required: false,
                                    isDefaultImage: true
                                },
                                Icon: {
                                    Id: '',
                                    showLabel: true,
                                    defaultValue: "",
                                    size: 8,
                                    type: 'filereader',
                                    Enabled: true,
                                    Content: dataStore.get('DefaultImages.Android.XXHDPI.Icon'),
                                    imageSize: '144 x 144',
                                    config: {
                                        type: '.png',
                                        readFileAs: 'readAsDataURL',
                                        width: 144,
                                        height: 144
                                    },
                                    required: false,
                                    isDefaultImage: true
                                },
                                Background: {
                                    Id: '',
                                    showLabel: true,
                                    defaultValue: "",
                                    size: 8,
                                    type: 'filereader',
                                    Enabled: false,
                                    Content: dataStore.get('DefaultImages.Android.XXHDPI.Background'),
                                    imageSize: '578 x 962',
                                    config: {
                                        type: '.png',
                                        readFileAs: 'readAsDataURL',
                                        width: 578,
                                        height: 962
                                    },
                                    required: false,
                                    isDefaultImage: true
                                },
                                SplashScreen: {
                                    Id: '',
                                    showLabel: true,
                                    defaultValue: "",
                                    size: 8,
                                    type: 'filereader',
                                    Enabled: false,
                                    Content: dataStore.get('DefaultImages.Android.XXHDPI.SplashScreen'),
                                    imageSize: '578 x 962',
                                    config: {
                                        type: '.png',
                                        readFileAs: 'readAsDataURL',
                                        width: 578,
                                        height: 962
                                    },
                                    required: false,
                                    isDefaultImage: true
                                },
                                StoreLogo: {
                                    Id: '',
                                    showLabel: true,
                                    defaultValue: "",
                                    size: 8,
                                    type: 'filereader',
                                    Enabled: false,
                                    Content: dataStore.get('DefaultImages.Android.XXHDPI.StoreLogo'),
                                    imageSize: '120 x 120',
                                    config: {
                                        type: '.png',
                                        readFileAs: 'readAsDataURL',
                                        width: 120,
                                        height: 120
                                    },
                                    required: false,
                                    isDefaultImage: true
                                },
                            },
                            XHDPI: {
                                Logo: {
                                    Id: '',
                                    showLabel: true,
                                    defaultValue: "",
                                    size: 8,
                                    type: 'filereader',
                                    Enabled: true,
                                    Content: dataStore.get('DefaultImages.Android.XHDPI.Logo'),
                                    imageSize: '733 x 100',
                                    config: {
                                        type: '.png',
                                        readFileAs: 'readAsDataURL',
                                        width: 733,
                                        height: 100
                                    },
                                    required: false,
                                    isDefaultImage: true
                                },
                                Icon: {
                                    Id: '',
                                    showLabel: true,
                                    defaultValue: "",
                                    size: 8,
                                    type: 'filereader',
                                    Enabled: true,
                                    Content: dataStore.get('DefaultImages.Android.XHDPI.Icon'),
                                    imageSize: '96 x 96',
                                    config: {
                                        type: '.png',
                                        readFileAs: 'readAsDataURL',
                                        width: 96,
                                        height: 96
                                    },
                                    required: false,
                                    isDefaultImage: true
                                },
                                Background: {
                                    Id: '',
                                    showLabel: true,
                                    defaultValue: "",
                                    size: 8,
                                    type: 'filereader',
                                    Enabled: true,
                                    Content: dataStore.get('DefaultImages.Android.XHDPI.Background'),
                                    imageSize: '770 x 1282',
                                    config: {
                                        type: '.png',
                                        readFileAs: 'readAsDataURL',
                                        width: 770,
                                        height: 1280
                                    },
                                    required: false,
                                    isDefaultImage: true
                                },
                                SplashScreen: {
                                    Id: '',
                                    showLabel: true,
                                    defaultValue: "",
                                    size: 8,
                                    type: 'filereader',
                                    Enabled: false,
                                    Content: dataStore.get('DefaultImages.Android.XHDPI.SplashScreen'),
                                    imageSize: '770 x 1282',
                                    config: {
                                        type: '.png',
                                        readFileAs: 'readAsDataURL',
                                        width: 770,
                                        height: 1280
                                    },
                                    required: false,
                                    isDefaultImage: true
                                },
                                StoreLogo: {
                                    Id: '',
                                    showLabel: true,
                                    defaultValue: "",
                                    size: 8,
                                    type: 'filereader',
                                    Enabled: false,
                                    Content: dataStore.get('DefaultImages.Android.XHDPI.StoreLogo'),
                                    imageSize: '120 x 120',
                                    config: {
                                        type: '.png',
                                        readFileAs: 'readAsDataURL',
                                        width: 120,
                                        height: 120
                                    },
                                    required: false,
                                    isDefaultImage: true
                                },
                            },
                            Land_XHDPI: {
                                Logo: {
                                    Id: '',
                                    showLabel: true,
                                    defaultValue: "",
                                    size: 8,
                                    type: 'filereader',
                                    Enabled: false,
                                    Content: dataStore.get('DefaultImages.Android.Land_XHDPI.Logo'),
                                    imageSize: '345 x 87',
                                    config: {
                                        type: '.png',
                                        readFileAs: 'readAsDataURL',
                                        width: 345,
                                        height: 87
                                    },
                                    required: false,
                                    isDefaultImage: true
                                },
                                Icon: {
                                    Id: '',
                                    showLabel: true,
                                    defaultValue: "",
                                    size: 8,
                                    type: 'filereader',
                                    Enabled: false,
                                    Content: dataStore.get('DefaultImages.Android.Land_XHDPI.Icon'),
                                    imageSize: '160 x 160',
                                    config: {
                                        type: '.png',
                                        readFileAs: 'readAsDataURL',
                                        width: 160,
                                        height: 160
                                    },
                                    required: false,
                                    isDefaultImage: true
                                },
                                Background: {
                                    Id: '',
                                    showLabel: true,
                                    defaultValue: "",
                                    size: 8,
                                    type: 'filereader',
                                    Enabled: true,
                                    Content: dataStore.get('DefaultImages.Android.Land_XHDPI.Background'),
                                    imageSize: '1282 x 770',
                                    config: {
                                        type: '.png',
                                        readFileAs: 'readAsDataURL',
                                        width: 1282,
                                        height: 770
                                    },
                                    required: false,
                                    isDefaultImage: true
                                },
                                SplashScreen: {
                                    Id: '',
                                    showLabel: true,
                                    defaultValue: "",
                                    size: 8,
                                    type: 'filereader',
                                    Enabled: false,
                                    Content: dataStore.get('DefaultImages.Android.Land_XHDPI.SplashScreen'),
                                    imageSize: '1282 x 770',
                                    config: {
                                        type: '.png',
                                        readFileAs: 'readAsDataURL',
                                        width: 1282,
                                        height: 770
                                    },
                                    required: false,
                                    isDefaultImage: true
                                },
                                StoreLogo: {
                                    Id: '',
                                    showLabel: true,
                                    defaultValue: "",
                                    size: 8,
                                    type: 'filereader',
                                    Enabled: false,
                                    Content: dataStore.get('DefaultImages.Android.Land_XHDPI.StoreLogo'),
                                    imageSize: '120 x 120',
                                    config: {
                                        type: '.png',
                                        readFileAs: 'readAsDataURL',
                                        width: 120,
                                        height: 120
                                    },
                                    required: false,
                                    isDefaultImage: true
                                },
                            },
                            isSelected: function () {
                                return this.parent().parent().get('PlatformSelector.CreateAndroidApp');
                            }
                        },
                        iOS: {
                            Logo: {
                                Id: '',
                                showLabel: true,
                                defaultValue: "",
                                size: 8,
                                type: 'filereader',
                                Enabled: false,
                                Content: dataStore.get('DefaultImages.Logo'),
                                imageSize: '345 x 87',
                                config: {
                                    type: '.jpg,.png,.jpeg',
                                    readFileAs: 'readAsDataURL',
                                    width: 345,
                                    height: 87
                                },
                                required: false,
                                isDefaultImage: true
                            },
                            Icon: {
                                Id: '',
                                showLabel: true,
                                defaultValue: "",
                                size: 8,
                                type: 'filereader',
                                Enabled: true,
                                Content: dataStore.get('DefaultImages.iOS.Icon'),
                                imageSize: '120 x 120',
                                config: {
                                    type: '.jpg,.png,.jpeg',
                                    readFileAs: 'readAsDataURL',
                                    width: 120,
                                    height: 120
                                },
                                required: true,
                                fileName: 'iOS_Icon-iPhone@2x',
                                isDefaultImage: true
                            },
                            Icon_iPad: {
                                Id: '',
                                showLabel: true,
                                defaultValue: "",
                                size: 8,
                                type: 'filereader',
                                Enabled: true,
                                Content: dataStore.get('DefaultImages.iOS.Icon_iPad'),
                                imageSize: '152 x 152',
                                config: {
                                    type: '.jpg,.png,.jpeg',
                                    readFileAs: 'readAsDataURL',
                                    width: 152,
                                    height: 152
                                },
                                required: true,
                                fileName: 'iOS_Icon-iPad@2x',
                                isDefaultImage: true
                            },
                            //Background: {
                            //    Id: '',
                            //    showLabel: true,
                            //    defaultValue: "",
                            //    size: 8,
                            //    type: 'filereader',
                            //    Enabled: true,
                            //    Content: '',
                            //    imageSize:'100 x 100',
                            //    config: {
                            //        type: '.jpg,.png,.jpeg',
                            //        readFileAs: 'readAsDataURL'
                            //    }
                            //},
                            SplashScreen: {
                                Id: '',
                                showLabel: true,
                                defaultValue: "",
                                size: 8,
                                type: 'filereader',
                                Enabled: true,
                                Content: dataStore.get('DefaultImages.iOS.SplashScreen'),
                                imageSize: '640 x 1136',
                                config: {
                                    type: '.jpg,.png,.jpeg',
                                    readFileAs: 'readAsDataURL',
                                    width: 640,
                                    height: 1136
                                },
                                required: true,
                                fileName: 'iOS_Default-568h@2x',
                                isDefaultImage: true
                            },
                            SplashScreen_iPad: {
                                Id: '',
                                showLabel: true,
                                defaultValue: "",
                                size: 8,
                                type: 'filereader',
                                Enabled: true,
                                Content: dataStore.get('DefaultImages.iOS.SplashScreen_iPad'),
                                imageSize: '1536 x 2048',
                                config: {
                                    type: '.jpg,.png,.jpeg',
                                    readFileAs: 'readAsDataURL',
                                    width: 1536,
                                    height: 2048
                                },
                                required: true,
                                fileName: 'iOS_Default-Portrait@2x~iPad',
                                isDefaultImage: true
                            },
                            StoreLogo: {
                                Id: '',
                                showLabel: true,
                                defaultValue: "",
                                size: 8,
                                type: 'filereader',
                                Enabled: false,
                                Content: dataStore.get('DefaultImages.iOS.StoreLogo'),
                                imageSize: '120 x 120',
                                config: {
                                    type: '.jpg,.png,.jpeg',
                                    readFileAs: 'readAsDataURL',
                                    width: 120,
                                    height: 120
                                },
                                required: false,
                                isDefaultImage: true
                            },
                            isSelected: function () {
                                return this.parent().parent().get('PlatformSelector.CreateiPhoneAndiPadApp');
                            }
                        },
                        Windows: {
                            Logo: {
                                Id: '',
                                showLabel: true,
                                defaultValue: "",
                                size: 8,
                                type: 'filereader',
                                Enabled: true,
                                Content: dataStore.get('DefaultImages.Windows.Logo'),
                                imageSize: '345 x 87',
                                config: {
                                    type: '.jpg,.png,.jpeg',
                                    readFileAs: 'readAsDataURL',
                                    width: 345,
                                    height: 87
                                },
                                required: true,
                                isDefaultImage: true
                            },
                            Icon: {
                                Id: '',
                                showLabel: true,
                                defaultValue: "",
                                size: 8,
                                type: 'filereader',
                                Enabled: true,
                                Content: dataStore.get('DefaultImages.Windows.Icon'),
                                imageSize: '360 x 360',
                                config: {
                                    type: '.jpg,.png,.jpeg',
                                    readFileAs: 'readAsDataURL',
                                    width: 360,
                                    height: 360
                                },
                                required: true,
                                isDefaultImage: true
                            },
                            Background: {
                                Id: '',
                                showLabel: true,
                                defaultValue: "",
                                size: 8,
                                type: 'filereader',
                                Enabled: true,
                                Content: dataStore.get('DefaultImages.Windows.Background'),
                                imageSize: '480 x 800',
                                config: {
                                    type: '.jpg,.png,.jpeg',
                                    readFileAs: 'readAsDataURL',
                                    width: 480,
                                    height: 800
                                },
                                fileName: 'Windows_BackGround',
                                isDefaultImage: true
                            },
                            SplashScreen: {
                                Id: '',
                                showLabel: true,
                                defaultValue: "",
                                size: 8,
                                type: 'filereader',
                                Enabled: true,
                                Content: dataStore.get('DefaultImages.Windows.SplashScreen'),
                                imageSize: '1152 x 1920',
                                config: {
                                    type: '.jpg,.png,.jpeg',
                                    readFileAs: 'readAsDataURL',
                                    width: 1152,
                                    height: 1920
                                },
                                required: true,
                                isDefaultImage: true
                            },
                            //StoreLogo: {
                            //    Id: '',
                            //    showLabel: true,
                            //    defaultValue: "",
                            //    size: 8,
                            //    type: 'filereader',
                            //    Enabled: true,
                            //    Content: '',
                            //    imageSize: '120 x 120',
                            //    config: {
                            //        type: '.jpg,.png,.jpeg',
                            //        readFileAs: 'readAsDataURL',
                            //        width: 120,
                            //        height: 120
                            //    },
                            //    required: true
                            //},
                            isSelected: function () {
                                return this.parent().parent().get('PlatformSelector.CreateWindowsPhoneApp');
                            }
                        },
                        isActive: false,
                        isComplete: false,
                        canNavigate: true,
                        validate: function (e) {
                            var vm = AP.Config.loadQuery(Id).get('Form.UploadImages'),
                                isValid = true,
                                vmPath = e && e.sender && $(e.sender.element).data('vm-path');

                            vmPath && (this.set(vmPath + '.Id', ''), this.set(vmPath + '.isDefaultImage', false));

                            // Check image dimension if specified in image config.
                            if (vmPath && this.get(vmPath + '.Content')) {
                                var imageConfig = this.get(vmPath + '.config');
                                isValid = AP.Utils.verifyImageDimensions.call(e, AP, this.get(vmPath + '.Content'), imageConfig);
                                !isValid && (AP.View.showAlert(kendo.format('Invalid image. Please select a image with {0} x {1} dimension.', imageConfig.width, imageConfig.height)), this.set(vmPath + '.Content', ''));
                            };

                            $.each(vm, function (platformName, platformValue) {
                                if (platformValue.hasOwnProperty('isSelected') && platformValue.isSelected()) {
                                    $.each(platformValue, function (key, value) {
                                        if (value.hasOwnProperty('Icon') && platformName == 'Android') {
                                            $.each(value, function (imageKey, imageData) {
                                                if (imageData.hasOwnProperty('Content') && imageData.Enabled && imageData.required && !imageData.Content) {
                                                    isValid = false;
                                                    return false;
                                                };
                                            });
                                        }
                                        else if (value.hasOwnProperty('Content') && value.Enabled && value.required && !value.Content) {
                                            isValid = false;
                                            return false;
                                        };
                                    });
                                };
                            });

                            vm.set('canNavigate', isValid);
                        }
                    },
                    ApplicationFilter: {
                        isActive: false,
                        isComplete: false,
                        isFilterEnabled: function () {
                            return this.get('filterValue') == 'yes';
                        },
                        filterValue: 'no',
                        SelectedApps: [],
                        canNavigate: true,
                        dataSource: [],
                        toggleSelection: function (e) {
                            var vm = AP.Config.loadQuery(Id).get('Form.ApplicationFilter'),
                                data = vm.get('dataSource');

                            if (vm.get('filterValue') == 'no') {
                                data.forEach(function (item) { item.set('isChecked', true); });
                            }
                            else {
                                data.forEach(function (item) { item.set('isChecked', false); });
                                vm.updateStatus();
                            };
                            vm.set('canNavigate', (!vm.isFilterEnabled() || (vm.get('SelectedApps').length>0)));
                        }, 
                        updateStatus: function () {
                            var that = this,
                                selectedList = that.get('SelectedApps'),
                                dataSource = that.get('dataSource');

                            dataSource.forEach(function (item) {
                                if (selectedList.indexOf(item.Value) > -1 || !that.isFilterEnabled()) {
                                    item.set('isChecked', true);
                                };
                            });
                            that.set('canNavigate', (!that.isFilterEnabled() || (that.get('SelectedApps').length>0)));
                        },
                        updateSelectedList: function (e) {
                            var vm = AP.Config.loadQuery(Id).get('Form.ApplicationFilter'),
                                selectedList = vm.get('SelectedApps');

                            if ($(e.target).prop('checked')) {
                                selectedList.push(e.data.Value);
                            }
                            else {
                                selectedList.remove(e.data.Value);
                            };
                            vm.set('canNavigate', (!vm.isFilterEnabled() || (vm.get('SelectedApps').length>0)));
                        }
                    },
                    AppMenu: {
                        isActive: false,
                        isComplete: false,
                        canNavigate: true,
                        Options: [
                            {
                                Name: 'MyApps',
                                Value: 'My Apps',
                                isEnabled: true
                            },
                            {
                                Name: 'MyTasks',
                                Value: 'My Tasks',
                                isEnabled: true
                            },
                            {
                                Name: 'TeamTasks',
                                Value: 'Team Tasks',
                                isEnabled: true
                            },
                            {
                                Name: 'ProcessesIStarted',
                                Value: 'Processes I Started',
                                isEnabled: true
                            },
                            {
                                Name: 'ProcessesIWorked',
                                Value: 'Processes I\'ve Worked',
                                isEnabled: true
                            },
                            {
                                Name: 'Delegations',
                                Value: 'Delegations',
                                isEnabled: true
                            },
                            {
                                Name: 'Settings',
                                Value: 'Settings',
                                isEnabled: true
                            },
                            {
                                Name: 'Help',
                                Value: 'Help',
                                isEnabled: true
                            },
                            {
                                Name: 'About',
                                Value: 'About',
                                isEnabled: true
                            }
                        ]
                    },
                    ApplicationThemes: {
                        Blue: {
                            isSelected: true
                        },
                        Red: {
                            isSelected: false
                        },
                        Green: {
                            isSelected: false
                        },
                        Orange: {
                            isSelected: false
                        },
                        previewImage: 'Blue',
                        backgroundColorCode: '#537db3',
                        menuColorCode: '#1f7cf5',
                        buttonColorCode: '#15437E',
                        isActive: false,
                        isComplete: false,
                        canNavigate: true,
                        changeSelection: function (e) {
                            var vm = AP.Config.loadQuery(Id).get('Form.ApplicationThemes'),
                                $target = $(e.currentTarget),
                                selectedTheme = $target.data('name');

                            selectedTheme && $.each(vm, function (key, value) {
                                if (vm.hasOwnProperty(key) && value.hasOwnProperty('isSelected')) {
                                    if (selectedTheme === key) {
                                        value.set('isSelected', true);
                                        vm.set('previewImage', selectedTheme);
                                        vm.set('backgroundColorCode', '#' + $target.data('background-color-code'));
                                        vm.set('menuColorCode', '#' + $target.data('menu-color-code'));
                                        vm.set('buttonColorCode', '#' + $target.data('button-color-code'));
                                    }
                                    else {
                                        value.set('isSelected', false);
                                    }
                                };
                            });
                        }
                    },
                    StoreCertificate: {
                        IosCertificate: {
                            Id: '',
                            showLabel: true,
                            defaultValue: "",
                            size: 8,
                            type: 'filereader',
                            Enabled: true,
                            CertificateFileName: '',
                            Content: '',
                            config: {
                                type: '.p12',
                                readFileAs: 'readAsDataURL',
                                disableFileTypeValidation: true
                            },
                            Password: '',
                            helpText: function () {
                                var selectedOption = this.parent().parent().get('PlatformSelector.iPhoneAndiPadBuildType').toLowerCase();

                                return EnumIosCertificateHelpText[selectedOption] || '';
                            },
                            contentType: 'p12',
                            required: true,
                            isSelected: function () {
                                return this.parent().parent().get('PlatformSelector.CreateiPhoneAndiPadApp');
                            },
                            isValid: function () {
                                return this.get('required') ? !!this.get('Content') : true;
                            },
                            saveFileName: function (args) {
                                var vm = AP.Config.loadQuery(Id);
                                args.fileName && vm && vm.set('Form.StoreCertificate.IosCertificate.CertificateFileName', args.fileName);
                            }
                        },
                        ProvisioningProfile: {
                            Id: '',
                            showLabel: true,
                            defaultValue: "",
                            size: 8,
                            type: 'filereader',
                            Enabled: true,
                            CertificateFileName: '',
                            Content: '',
                            ProvisioningProfileUUID: '',
                            AppBundleIdentifier: '',
                            config: {
                                type: '',
                                readFileAs: 'readAsDataURL',
                                disableFileTypeValidation: true
                            },
                            contentType: '',
                            helpText: function () {
                                var selectedOption = this.parent().parent().get('PlatformSelector.iPhoneAndiPadBuildType').toLowerCase();

                                return EnumProvisioningProfileHelpText[selectedOption] || '';
                            },
                            required: true,
                            isSelected: function () {
                                return this.parent().parent().get('PlatformSelector.CreateiPhoneAndiPadApp');
                            },
                            isValid: function () {
                                return this.get('required') ? !!this.get('Content') : true;
                            },
                            saveFileName: function (args) {
                                var vm = AP.Config.loadQuery(Id);
                                args.fileName && vm && vm.set('Form.StoreCertificate.ProvisioningProfile.CertificateFileName', args.fileName);
                            }
                        },
                        WindowsCertificate: {
                            Id: '',
                            showLabel: true,
                            defaultValue: "",
                            size: 8,
                            type: 'filereader',
                            Enabled: true,
                            CertificateFileName: '',
                            Content: '',
                            config: {
                                type: '.pfx',
                                readFileAs: 'readAsDataURL',
                                disableFileTypeValidation: true
                            },
                            Password: '',
                            PublisherId: '',
                            PhonePublisherId: '',
                            PhoneProductId: '',
                            contentType: 'pfx',
                            required: false,
                            isSelected: function () {
                                return this.parent().parent().get('PlatformSelector.CreateWindowsPhoneApp');
                            },
                            isValid: function () {
                                return this.get('required') ? !!this.get('Content') : true;
                            },
                            isPublisherFieldsRequired: function () {
                                var buildType = this.parent().parent().get('PlatformSelector.WindowsPhoneBuildType').toLowerCase();

                                return (buildType == 'store' /*|| buildType == 'mdm'*/);

                                //return true;
                            },
                            saveFileName: function (args) {
                                var vm = AP.Config.loadQuery(Id);
                                args.fileName && vm && vm.set('Form.StoreCertificate.WindowsCertificate.CertificateFileName', args.fileName);
                            }
                        },
                        AndroidCertificate: {
                            Id: '',
                            showLabel: true,
                            defaultValue: "",
                            size: 8,
                            type: 'filereader',
                            Enabled: true,
                            isVisible: function () {
                                var isCertificateRequired = this.parent().parent().get('PlatformSelector.AndroidBuildType').toLowerCase() == 'store';

                                this.set('UseCustomCert', isCertificateRequired && this.get('isSelected').call(this));

                                return isCertificateRequired;
                            },
                            Content: '',
                            config: {
                                type: '.key',
                                readFileAs: 'readAsDataURL',
                                disableFileTypeValidation: true
                            },
                            Password: '',
                            PackageName: '',
                            CertificateFileName: '',
                            UseCustomCert: false,
                            storePassword: '',
                            keyAlias: '',
                            keyPassword: '',
                            contentType: 'key',
                            required: false,
                            isSelected: function () {
                                return this.parent().parent().get('PlatformSelector.CreateAndroidApp');
                            },
                            isValid: function () {
                                return this.get('UseCustomCert') ? (this.get('Content') && this.get('keyAlias') && this.get('keyPassword') && this.get('storePassword') && this.get('PackageName')) : this.get('PackageName');
                            },
                            saveFileName: function (args) {
                                var vm = AP.Config.loadQuery(Id);
                                args.fileName && vm && vm.set('Form.StoreCertificate.AndroidCertificate.CertificateFileName', args.fileName);
                            }
                        },
                        isActive: false,
                        isComplete: false,
                        canNavigate: function () {
                            var me = this,
                                canNavigate = true;

                            $.each(me, function (platform, config) {
                                if (config.Enabled) {
                                    if (config.get('isSelected').call(config) && !config.get('isValid').call(config)) {
                                        canNavigate = false;
                                    };
                                };
                            });

                            return canNavigate;
                        }
                    },
                    NotificationList: {
                        isActive: false,
                        isComplete: false,
                        canNavigate: true
                    },
                    NavigationPanel: {
                        isCertificateRequired: function () {
                            //return (this.parent().get('PlatformSelector.CreateiPhoneAndiPadApp') || this.parent().get('PlatformSelector.CreateWindowsPhoneApp'));
                            return true;
                        }
                    }
                },
                Controls: {
                    isBuildRequestExists: false,
                    Build: {
                        Android: {
                            isBuildRequested: false,
                            downloadUrl: '',
                            buildRequestId: '',
                            status: AP.View.Internationalize.translate('sections.editApp.appBuildStatus.notEnabled'),
                            isDownloadAvailable: function () {
                                return this.get('isBuildRequested') && this.get('buildRequestId');
                            }
                        },
                        iOS: {
                            isBuildRequested: false,
                            downloadUrl: '',
                            buildRequestId: '',
                            status: AP.View.Internationalize.translate('sections.editApp.appBuildStatus.notEnabled'),
                            isDownloadAvailable: function () {
                                return this.get('isBuildRequested') && this.get('buildRequestId');
                            }
                        },
                        Windows: {
                            isBuildRequested: false,
                            downloadUrl: '',
                            buildRequestId: '',
                            status: AP.View.Internationalize.translate('sections.editApp.appBuildStatus.notEnabled'),
                            isDownloadAvailable: function () {
                                return this.get('isBuildRequested') && this.get('buildRequestId');
                            }
                        }
                    }
                },
                Messages: {
                    text: ''
                }
            }
        }

    };

    return AddEditApp;
});