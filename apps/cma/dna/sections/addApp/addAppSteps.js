define(function () {
    // old
    return function () {
        return {
            Blocks: [

                {
                    Widget: {
                        Type: 'APWizardStep',
                        Class: 'ApplicationSettings',
                        Name: 'ApplicationSettings',
                        Config: {
                            StepIndex: 0,
                            QueryId: 'CMAAddOrEditApp'
                        }
                    },
                    Blocks: [
                        {
                            Name: 'ApplicationSettingsForm',
                            Widget: {
                                Type: 'APForm',
                                QueryId: 'CMAAddOrEditApp',
                                Config: {
                                    //rules: ['regexValidationForEmail', 'regexValidationForWebAddress'], 
                                    FormTemplate: {
                                        Path: 'apps/cma/content/sections/addApp/applicationSettings'
                                    },
                                    Buttons: [
                                        {
                                            attr: {
                                                'data-step-target': 'AuthenticationConfiguration',
                                                'data-skip-click': true,
                                                'data-bind': 'enabled:State.Query.CMAAddOrEditApp.Form.ApplicationSettings.canNavigate'
                                            },
                                            iconRequired: false,
                                            text: 'form:Buttons.Next',
                                            Class: 'step-controller'
                                        }
                                    ],
                                    resetQuery: true
                                }
                            }
                        }
                    ]
                },
                {
                    Widget: {
                        Type: 'APWizardStep',
                        Class: 'AuthenticationConfiguration',
                        Name: 'AuthenticationConfiguration',
                        Config: {
                            StepIndex: 1,
                            QueryId: 'CMAAddOrEditApp'
                        }
                    },
                    Blocks: [
                        {
                            Class: 'AuthenticationConfigurationForm',
                            Widget: {
                                Type: 'APForm',
                                QueryId: 'CMAAddOrEditApp',
                                Config: {
                                    rules: ['regexValidationForServerUrl'],
                                    FormTemplate: {
                                        Path: 'apps/cma/content/sections/addApp/authenticationConfiguration'
                                    },
                                    Buttons: [
                                        {
                                            attr: {
                                                'data-step-target': 'ApplicationSettings',
                                                'data-skip-click': true,
                                                'data-skip-validate': true
                                            },
                                            iconRequired: false,
                                            text: 'form:Buttons.Back',
                                            Class: 'step-controller'
                                        },
                                        {
                                            attr: {
                                                'data-step-target': 'ApplicationFilter',
                                                'data-skip-click': true,
                                            },
                                            iconRequired: false,
                                            text: 'form:Buttons.Next',
                                            Class: 'step-controller'
                                        }
                                    ]
                                }
                            }
                        }
                    ]
                },
                {
                    Widget: {
                        Type: 'APWizardStep',
                        Class: 'ApplicationFilter',
                        Name: 'ApplicationFilter',
                        Config: {
                            StepIndex: 2,
                            QueryId: 'CMAAddOrEditApp'
                        }
                    },
                    Blocks: [
                        {
                            Name: 'ApplicationFilterForm',
                            Widget: {
                                Type: 'APForm',
                                QueryId: 'CMAAddOrEditApp',
                                Config: {
                                    FormTemplate: {
                                        Path: 'apps/cma/content/sections/addApp/applicationFilter'
                                    },
                                    Buttons: [
                                        {
                                            attr: {
                                                'data-step-target': 'AuthenticationConfiguration',
                                                'data-skip-click': true,
                                                'data-skip-validate': true
                                            },
                                            iconRequired: false,
                                            text: 'form:Buttons.Back',
                                            Class: 'step-controller'
                                        },
                                        {
                                            attr: {
                                                'data-step-target': 'AppMenu',
                                                'data-skip-click': true,
                                                'data-bind': 'enabled:State.Query.CMAAddOrEditApp.Form.ApplicationFilter.canNavigate'
                                            },
                                            iconRequired: false,
                                            text: 'form:Buttons.Next',
                                            Class: 'step-controller'
                                        }
                                    ]
                                }
                            }
                        },
                        //{
                        //    Bindings: [
                        //        {
                        //            visible: 'State.Query.CMAAddOrEditApp.Form.ApplicationFilter.isFilterEnabled'
                        //        }
                        //    ],
                        //    Name: 'ApplicationFilterList',
                        //    Class: 'ApplicationFilterList',
                        //    Widget: {
                        //        Type: 'APListView',
                        //        QueryId: 'CMAGetReleasedApplications',
                        //        Config: {
                        //            checkable: true,
                        //            checkedStateTrackingMember: 'isChecked',
                        //            template: {
                        //                Path: 'apps/cma/content/sections/addApp/applicationFilterListTemplate'
                        //            },
                        //            //autoBind: false,
                        //            customScroll: true,
                        //            //dataSourcePath: 'State.Query.CMAAddOrEditApp.Form.ApplicationFilter.SelectedApps'
                        //            /* Uncomment below lines to enable animation */
                        //            //animateItems:true,
                        //            //selector: '.ListItem[role=option]'
                        //        }
                        //    }
                        //},
                        //{
                        //    Widget: {
                        //        Type: 'APForm',
                        //        Config: {
                        //            Buttons: [
                        //                {
                        //                    attr: {
                        //                        'data-step-target': 'AuthenticationConfiguration',
                        //                        'data-skip-click': true,
                        //                        'data-skip-validate': true
                        //                    },
                        //                    iconRequired: false,
                        //                    text: 'form:Buttons.Back',
                        //                    Class: 'step-controller'
                        //                },
                        //                {
                        //                    attr: {
                        //                        'data-step-target': 'AppMenu',
                        //                        'data-skip-click': true,
                        //                        'data-bind': 'enabled:State.Query.CMAAddOrEditApp.Form.ApplicationFilter.canNavigate'
                        //                    },
                        //                    iconRequired: false,
                        //                    text: 'form:Buttons.Next',
                        //                    Class: 'step-controller'
                        //                }
                        //            ]
                        //        }
                        //    }
                        //}
                    ]
                },
                {
                    Widget: {
                        Type: 'APWizardStep',
                        Class: 'AppMenu',
                        Name: 'AppMenu',
                        Config: {
                            StepIndex: 3,
                            QueryId: 'CMAAddOrEditApp'
                        }
                    },
                    Blocks: [
                        {
                            Widget: {
                                Type: 'APForm',
                                QueryId: 'CMAAddOrEditApp',
                                Config: {
                                    rules: ['regexValidationForSpecialChars'],
                                    FormTemplate: {
                                        Path: 'apps/cma/content/sections/addApp/appMenu'
                                    },
                                    Buttons: [
                                        {
                                            attr: {
                                                'data-step-target': 'ApplicationFilter',
                                                'data-skip-click': true,
                                                'data-skip-validate': true
                                            },
                                            iconRequired: false,
                                            text: 'form:Buttons.Back',
                                            Class: 'step-controller'
                                        },
                                        {
                                            attr: {
                                                'data-step-target': 'ApplicationThemes',
                                                'data-skip-click': true,
                                                'data-bind': 'enabled:State.Query.CMAAddOrEditApp.Form.AppMenu.canNavigate'
                                            },
                                            iconRequired: false,
                                            text: 'form:Buttons.Next',
                                            Class: 'step-controller'
                                        }
                                    ]
                                }
                            }
                        }
                    ]
                },
                {
                    Widget: {
                        Type: 'APWizardStep',
                        Class: 'ApplicationThemes',
                        Name: 'ApplicationThemes',
                        Config: {
                            StepIndex: 4,
                            QueryId: 'CMAAddOrEditApp'
                        }
                    },
                    Blocks: [
                        {
                            Name: 'ApplicationThemeSelector',
                            Widget: {
                                Type: 'APForm',
                                QueryId: 'CMAAddOrEditApp',
                                Config: {
                                    FormTemplate: {
                                        Path: 'apps/cma/content/sections/addApp/themes'
                                    },
                                    Buttons: [
                                        {
                                            attr: {
                                                'data-step-target': 'AppMenu',
                                                'data-skip-click': true,
                                                'data-skip-validate': true
                                            },
                                            iconRequired: false,
                                            text: 'form:Buttons.Back',
                                            Class: 'step-controller'
                                        },
                                        {
                                            attr: {
                                                'data-step-target': 'PlatformSelector',
                                                'data-skip-click': true,
                                                'data-bind': 'enabled:State.Query.CMAAddOrEditApp.Form.ApplicationThemes.canNavigate'
                                            },
                                            iconRequired: false,
                                            text: 'form:Buttons.Next',
                                            Class: 'step-controller'
                                        }
                                    ]
                                }
                            }
                        }
                    ]
                },
                {
                    Widget: {
                        Type: 'APWizardStep',
                        Class: 'PlatformSelector',
                        Name: 'PlatformSelector',
                        Config: {
                            StepIndex: 5,
                            QueryId: 'CMAAddOrEditApp'
                        }
                    },
                    Blocks: [
                        {
                            Name: 'PlatformSelectorForm',
                            Widget: {
                                Type: 'APForm',
                                QueryId: 'CMAAddOrEditApp',
                                Config: {
                                    FormTemplate: {
                                        Path: 'apps/cma/content/sections/addApp/platformSelector'
                                    },
                                    Buttons: [
                                        {
                                            attr: {
                                                'data-step-target': 'StoreCertificate',
                                                'data-skip-click': true,
                                            },
                                            iconRequired: false,
                                            text: 'form:Buttons.Next',
                                            Class: 'step-controller Invisible'
                                        },
                                        {
                                            attr: {
                                                'data-step-target': 'UploadImages',
                                                'data-skip-click': true,
                                            },
                                            iconRequired: false,
                                            text: 'form:Buttons.Next',
                                            Class: 'step-controller Invisible'
                                        },
                                        {
                                            attr: {
                                                'data-step-target': 'ApplicationThemes',
                                                'data-skip-click': true,
                                                'data-skip-validate': true
                                            },
                                            iconRequired: false,
                                            text: 'form:Buttons.Back',
                                            Class: 'step-controller'
                                        },
                                        {
                                            action: 'ProceedNext',
                                            attr: {
                                                'data-bind': 'enabled:State.Query.CMAAddOrEditApp.Form.PlatformSelector.canNavigate'
                                            },
                                            iconRequired: false,
                                            text: 'form:Buttons.Next'
                                        }
                                    ]
                                }
                            }
                        }
                    ]
                },
                {
                    Widget: {
                        Type: 'APWizardStep',
                        Class: 'StoreCertificate',
                        Name: 'StoreCertificate',
                        Config: {
                            StepIndex: 6,
                            QueryId: 'CMAAddOrEditApp'
                        }
                    },
                    Blocks: [
                        {
                            Name: 'IosCertificateForm',
                            Widget: {
                                Type: 'APForm',
                                QueryId: 'CMAAddOrEditApp',
                                Config: {
                                    rules: ['regexValidationForAndroidPackageName', 'regexValidationForPublisherName', 'regexValidationForPhonePublisherId'],
                                    FormTemplate: {
                                        Path: 'apps/cma/content/sections/addApp/storeCertificate'
                                    },
                                    Buttons: [
                                        {
                                            attr: {
                                                'data-step-target': 'PlatformSelector',
                                                'data-skip-click': true,
                                                'data-skip-validate': true
                                            },
                                            iconRequired: false,
                                            text: 'form:Buttons.Back',
                                            Class: 'step-controller'
                                        },
                                        {
                                            attr: {
                                                'data-step-target': 'UploadImages',
                                                'data-skip-click': true,
                                                'data-bind': 'enabled:State.Query.CMAAddOrEditApp.Form.StoreCertificate.canNavigate'
                                            },
                                            iconRequired: false,
                                            text: 'form:Buttons.Next',
                                            Class: 'step-controller'
                                        }
                                    ]
                                }
                            }
                        }
                    ]
                },
                {
                    Widget: {
                        Type: 'APWizardStep',
                        Class: 'UploadImages',
                        Name: 'UploadImages',
                        Config: {
                            StepIndex: 7,
                            QueryId: 'CMAAddOrEditApp'
                        }
                    },
                    Blocks: [
                        {
                            Name: 'ImageUploaderForm',
                            Widget: {
                                Type: 'APForm',
                                QueryId: 'CMAAddOrEditApp',
                                Config: {
                                    FormTemplate: {
                                        Path: 'apps/cma/content/sections/addApp/imageUploader'
                                    },
                                    Buttons: [
                                        {
                                            attr: {
                                                'data-step-target': 'StoreCertificate',
                                                'data-skip-click': true,
                                                'data-skip-validate': true
                                            },
                                            iconRequired: false,
                                            text: 'form:Buttons.Back',
                                            Class: 'step-controller Invisible'
                                        },
                                        {
                                            attr: {
                                                'data-step-target': 'PlatformSelector',
                                                'data-skip-click': true,
                                                'data-skip-validate': true
                                            },
                                            iconRequired: false,
                                            text: 'form:Buttons.Back',
                                            Class: 'step-controller Invisible'
                                        },
                                        {
                                            action: 'ProceedPrevious',
                                            iconRequired: false,
                                            text: 'form:Buttons.Back',
                                        },
                                        {
                                            attr: {
                                                'data-step-target': 'NotificationList',
                                                'data-skip-click': true,
                                                'data-bind': 'enabled:State.Query.CMAAddOrEditApp.Form.UploadImages.canNavigate'
                                            },
                                            iconRequired: false,
                                            text: 'form:Buttons.Next',
                                            Class: 'step-controller'
                                        }
                                    ]
                                }
                            }
                        }
                    ]
                },
                {
                    Widget: {
                        Type: 'APWizardStep',
                        Class: 'NotificationList',
                        Name: 'NotificationList',
                        Config: {
                            StepIndex: 8,
                            QueryId: 'CMAAddOrEditApp'
                        }
                    },
                    Blocks: [
                        {
                            Name: 'NotificationListForm',
                            Widget: {
                                Type: 'APForm',
                                QueryId: 'CMAAddOrEditApp',
                                Config: {
                                    FormTemplate: {
                                        Path: 'apps/cma/content/sections/addApp/notificationList'
                                    },
                                    Buttons: [
                                         {
                                             attr: {
                                                 'data-step-target': 'UploadImages',
                                                 'data-skip-click': true,
                                                 'data-skip-validate': true
                                             },
                                             iconRequired: false,
                                             text: 'form:Buttons.Back',
                                             Class: 'step-controller'
                                         },
                                         {
                                             action: 'SaveAsDraft',
                                             attr: {
                                                 'data-bind': 'enabled:State.Query.CMAAddOrEditApp.Form.NotificationList.canNavigate'
                                             },
                                             iconRequired: false,
                                             text: 'form:Buttons.SaveAsDraft',
                                         },
                                         {
                                             action: 'Publish',
                                             attr: {
                                                 'data-bind': 'enabled:State.Query.CMAAddOrEditApp.Form.NotificationList.canNavigate'
                                             },
                                             iconRequired: false,
                                             text: 'form:Buttons.Build',
                                         }
                                    ]
                                }
                            }
                        }
                    ]
                }
            ]
        }
    }
});