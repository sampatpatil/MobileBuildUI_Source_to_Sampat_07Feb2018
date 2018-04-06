define([], function () {
    
    var Id = 'CMAUserSettings',
        CMAUserSettings = {
            Id: Id,
            
            vm: function (AP) {
                dataStore = AP.Config.loadQuery('CMADataStore');
                //console.log('');
                //console.log(dataStore);

                return {
                    Id: Id,
                    Data: {
                        CompanyInfo: {
                            CompanyName: {
                                Content: ''
                            },
                            CompanyWebsite: {
                                Content: ''
                            },
                            CompanySupportEmail: {
                                Content: ''
                            },
                            CompanyInfoEmail: {
                                Content: ''
                            },
                            CopyrightInfo: {
                                Content: ''
                            }
                        },
                        Authentication: {
                            AgilePointID: {
                                ServerInstanceURL: {
                                    Content: ''
                                }   
                            },
                            ActiveDirectory: {
                                Domain: {
                                    Content: ''
                                }
                            },
                            SalesforceConfiguration: {
                                ConsumerKey: {
                                    Content: ''
                                },
                                ConsumerSecret: {
                                    Content: ''
                                },
                            },
                            WAADAndOfficeConfiguration: {
                                ClientID: {
                                    Content: ''
                                },
                                ReturnURL: {
                                    Content: ''
                                },
                                Resource: {
                                    Content: ''
                                }
                            },
                        },
                        ApplicationList: {
                            Id: '',
                            dataSource: [], 
                            showLabel: true,
                            defaultValue: "",
                            size: 8,
                            type: 'filereader',
                            Enabled: false,
                            Content: '',
                            config: {
                                type: '.json',
                            },
                            contentLoaded: function (e) {
                                debugger;
                                var queryId = e.sender.element.closest('.APForm').data('APWidget').QueryId,
                                    vm = AP.Config.loadQuery(queryId),
                                    serverData = null,
                                    fileData = null,
                                    mainList = null,
                                    tempList = null;

                                try {
                                    serverData = vm.get('Data.ApplicationList.dataSource');
                                } catch (e) {
                                    serverData = [];
                                };

                                try {
                                    fileData = JSON.parse(e.content).ApplicationList;

                                    if (!_.isArray(fileData)) throw 'Invalid File';

                                    if (serverData.length > fileData.length) {
                                        mainList = serverData;
                                        tempList = fileData;
                                        //Content = fileData;
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

                                    // var defaultStatus = false;//!vm.Form.ApplicationFilter.isFilterEnabled();
                                    // $('.ListItem').remove();
                                    // vm.set('Data.ApplicationList.dataSource', _.chain(tempList).pluck('Value').unique().sort().map(function (value, key) {
                                    //     return { Value: value, isChecked: defaultStatus, ID: 'asdf' };
                                    // }).value());
                                    
                                    var defaultStatus = false;//!vm.Form.ApplicationFilter.isFilterEnabled();
                                    $('.ListItem').remove();
                                    
                                    vm.set('Data.ApplicationList.dataSource', []);
                                    vm.set('Data.ApplicationList.dataSource', tempList);
                                    //vm.Form.ApplicationFilter.updateStatus();

                                } catch (err) {
                                    AP.View.showAlertKey('Selected file is invalid, please select a valid file and try again.');
                                    vm.set('Form.ApplicationFilter.dataSource', serverData);
                                    AP.Config.loadQuery(Id).set('Data.ApplicationList.Content', '');
                                    e.sender.wrapper.find('.k-button .k-delete').trigger('click');
                                };
                            },
                            required: true
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
                                        // fullID = 'Android.HDPI.Logo.Content',
                                        Content: dataStore.get('DefaultImages.Android.HDPI.Logo'),
                                        imageSize: '550 x 75',
                                        config: {
                                            type: '.png',
                                            readFileAs: 'readAsDataURL',
                                            width: 550,
                                            height: 75
                                        },
                                        required: false,
                                        isDefaultImage: true,
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
                                    return true;
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
                                    // fileName: 'iOS_Icon-iPad@2x',
                                    isDefaultImage: true
                                },
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
                                    // fileName: 'iOS_Default-568h@2x',
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
                                    // fileName: 'iOS_Default-Portrait@2x~iPad',
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
                                    return true;
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
                                isSelected: function () {
                                    return true;
                                }
                            },
                            validate: function (e) {
                                var vm = AP.Config.loadQuery(Id).get('Data.UploadImages'),
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
    
                                //vm.set('canNavigate', isValid);
                            }
                        },
                        EmailList: {
                            Id: '',
                            showLabel: true,
                            defaultValue: "",
                            size: 8,
                            type: 'filereader',
                            Enabled: true,
                            Content: '',
                            config: {
                                type: '.json',
                            },
                            value: '',
                            required: true,
                            contentLoaded: function (e) {
                                var vm = AP.Config.loadQuery(Id),
                                    emailListFromTextbox = (vm.get('Data.EmailList.value') || '').split(','),
                                    newList = [],
                                    parsedFileContent = [];

                                try {
                                    parsedFileContent = JSON.parse(vm.get('Data.EmailList.Content')).EmailList;

                                    if (!_.isArray(parsedFileContent)) throw 'Invalid File';

                                    $.each(emailListFromTextbox, function (idx, item) {
                                        item.length && newList.push(item.replace(/\s/g, ''));
                                    });

                                    $.each(parsedFileContent, function (idx, item) {
                                        if (newList.indexOf(item.Value) == -1) {
                                            newList.push(item.Value);
                                        };
                                    });

                                    vm.set('Data.EmailList.value', newList.join(', '));
                                } catch (err) {
                                    AP.View.showAlertKey('Selected file is invalid, please select a valid file and try again.');
                                    vm.set('Data.EmailList.value', '');
                                    vm.set('Data.EmailList.Content', '');
                                    e.sender.wrapper.find('.k-button .k-delete').trigger('click');
                                };
                            }
                        },
                    },
                    Message: {
                        Key: "api:query.success",
                        Values: ""
                    } 
                    // AgilePoint ID, Active Directory, Salesforce, WAAD/Office 365. 
                };
            }

        };

    return CMAUserSettings; 
});