define([], function () {
    return function () {
        // Add new app page and form design.
        return {
            Master: 'root',
            Blocks: [
                        {
                            ExBlocksClass: 'custom-scrollable AddNewApp',
                            Blocks: [
                                // {
                                //     Name: 'NavigationPanel',
                                //     ExClass: 'NavigationPanel',
                                //     Widget: {
                                //         Type: 'APTemplatedWidget',
                                //         QueryId: 'CMAAddOrEditApp',
                                //         Config: {
                                //             template: {
                                //                 Path: 'apps/cma/content/sections/addApp/settings'
                                //             }
                                //         }
                                //     }
                                // },
                                {
                                    Name: 'AddEditAppWizard',
                                    ExClass: 'AddNewAppSteps',
                                    Widget: {
                                        Type: 'APWizard'
                                    },
                                    Blocks: ['sections/addApp/settingsAddAppSteps']
                                }
                            ]
                        }
            ]
        };
    };
});