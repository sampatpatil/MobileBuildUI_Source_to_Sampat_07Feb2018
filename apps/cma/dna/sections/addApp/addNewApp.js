define([], function () {
    return function () {
        // Add new app page and form design.
        return {
            Master: 'root',
            DOM: 'section',
            Class: 'Body Landing',
            ExClass: 'custom-scrollable',
            Attr: {
                'data-nscroll-horizrailenabled': false
            },
            Blocks: [
                {
                    Class: 'MainMenu',
                    DOM: 'aside',
                    //Fields: [{ Text: 'sections.title' }],
                    Widget: {
                        Type: 'APMainMenu',
                        Config: {
                            ButtonTitle: 'Collapse Menu',
                            collapsible: true,
                            hoverDelay: 450
                        }
                    },
                    Blocks: [
                        'menu/sections'
                    ]
                },
                {
                    ExBlocksClass: 'custom-scrollable AddNewApp MyAppsContainer',
                    Blocks: [
                        {
                            Name: 'NavigationPanel',
                            ExClass: 'NavigationPanel ',
                            Widget: {
                                Type: 'APTemplatedWidget',
                                QueryId: 'CMAAddOrEditApp',
                                Config: {
                                    template: {
                                        Path: 'apps/cma/content/sections/addApp/navigationPanel'
                                    }
                                }
                            }
                        },
                        {
                            Name: 'AddEditAppWizard',
                            ExClass: 'AddNewAppSteps',
                            Widget: {
                                Type: 'APWizard'
                            },
                            Blocks: ['sections/addApp/addAppSteps']
                        }
                    ]
                }
            ]
        }
    };
});