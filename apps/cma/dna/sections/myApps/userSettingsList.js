define(function () {

    return function (Args) {
        // App list Contents.
        return {
            Replace: false,
            Blocks: [
                {
                    ExClass: 'MyAppsContainer',
                    ExBlocksClass: 'MyAppListContainerBlocks',
                    Blocks: [
                        {
                            ExBlocksClass: 'userSettingsTitle',
                            Blocks: [
                                {
                                    Name: 'UserSettings',
                                    ExClass: '',
                                    Widget: {
                                        Type: 'APTemplatedWidget',
                                        QueryId: 'CMAUserSettings',
                                        Config: {
                                            //', 'regexValidationForWebAddress'],
                                            template: {
                                                Path: 'apps/cma/content/sections/userSettings/userSettings'
                                            },
                                        }
                                    }
                                }
                            ]
                        },
                        {
                            Blocks: [
                                {
                                    Name: 'Authentication',
                                    ExClass: 'hide AuthenticationFormType',
                                    Widget: {
                                        Type: 'APTemplatedWidget',
                                        QueryId: 'CMAUserSettings',
                                        Config: {
                                            template: {
                                                Path: 'apps/cma/content/sections/userSettings/Authentication'
                                            },
                                        }
                                    }
                                }
                            ]
                        },
                        {
                            Blocks: [
                                {
                                    Name: 'ApplicationList',
                                    ExClass: 'hide ApplicationFilterFormType',
                                    Widget: {
                                        Type: 'APForm',
                                        QueryId: 'CMAUserSettings',
                                        Config: {
                                            FormTemplate: {
                                                Path: 'apps/cma/content/sections/userSettings/applicationFilterSettings'
                                            }
                                        }
                                    }
                                }
                            ]
                        },
                        {
                            Blocks: [
                                {
                                    Name: 'UploadImage',
                                    ExClass: 'hide UploadImageFormType',
                                    Widget: {
                                        Type: 'APForm',
                                        QueryId: 'CMAUserSettings',
                                        Config: {
                                            FormTemplate: {
                                                Path: 'apps/cma/content/sections/userSettings/imageUploader'
                                            }
                                        }
                                    }
                                }
                            ]
                        },
                        {
                            Blocks: [
                                {
                                    Name: 'NotificationList',
                                    ExClass: 'hide NotificationListFormType',
                                    Widget: {
                                        Type: 'APForm',
                                        QueryId: 'CMAUserSettings',
                                        Config: {
                                            FormTemplate: {
                                                Path: 'apps/cma/content/sections/userSettings/notificationList'
                                            }
                                        }
                                    }
                                }
                            ]
                        }

                    ]
                }
            ]
        }
    }
});