define(function () {
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
                                    // rules: ['regexValidationForEmail', 'regexValidationForWebAddress'],
                                    FormTemplate: {
                                        Path: 'apps/cma/content/sections/addApp/applicationSettings'
                                    },
                                    // Buttons: [
                                    //     {
                                    //         attr: {
                                    //             'data-step-target': 'ApplicationFilter',
                                    //             'data-skip-click': true,
                                    //             'data-bind': 'enabled:State.Query.CMAAddOrEditApp.Form.ApplicationSettings.canNavigate'
                                    //         },
                                    //         iconRequired: false,
                                    //         text: 'form:Buttons.Next',
                                    //         Class: 'step-controller'
                                    //     }
                                    // ],
                                    resetQuery: true
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
                            StepIndex: 1,
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
                                                'data-step-target': 'NotificationList',
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
                       
                    ]
                },
                {
                    Widget: {
                        Type: 'APWizardStep',
                        Class: 'NotificationList',
                        Name: 'NotificationList',
                        Config: {
                            StepIndex: 2,
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
                                                 'data-step-target': 'ApplicationSettings',
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