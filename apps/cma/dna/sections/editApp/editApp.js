define([], function () {
    return function (Args) {
        var AP = Args.AP,
            queryId = 'CMAAddOrEditApp';
        
        if (!AP.Config.loadQuery(queryId).get('Form.ApplicationSettings.Name')) {
            AP.Controller.route('go/sections/myApps');
            return {};
        };

        return {
            Master: 'root',
            Blocks: [
                        {
                            ExBlocksClass: 'custom-scrollable AddNewApp',
                            Blocks: [
                                // {
                                //     // To display back button.
                                //     Class: 'absolute',
                                //     Template: {
                                //         Path: 'apps/cma/content/templates/control/backbutton'
                                //     }
                                // },
                                //{
                                //    Fields: [{ Text: 'sections.editApp.title', Class: 'MainHeaders' }]
                                //},
                                {
                                    Name: 'NavigationPanel',
                                    ExClass: 'NavigationPanel',
                                    Widget: {
                                        Type: 'APTemplatedWidget',
                                        QueryId: queryId,
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
                                    Blocks: ['sections/editApp/editAppSteps']
                                }
                            ]
                        }
            ]
        };
    };
});