define(function () {
    return function () {
        return {
            Replace: false,
            Blocks: [
                {
                    ExClass: 'BuildRequestWindow',
                    KeyTitle: 'sections.requestForBuild.title',
                    Widget: {
                        Type: 'APWindow',
                        Config: {
                            AutoOpen: true,
                            modal: true,
                            width: 700,
                            resizable: false,
                            draggable: false
                        }
                    },
                    Blocks: [
                            {
                                Name: 'BuildRequestForm',
                                Widget: {
                                    Type: 'APForm',
                                    QueryId: 'CMARequestForBuild', //currently this is overridden - we are retrieving the current ActiveAppMetaData or Args.rowData to access current app data. we have it here only as a placeholder to support arguments when the widget is rendered.
                                    Config: {
                                        FormTemplate: {
                                            Path: 'apps/cma/content/sections/myApps/requestForBuild'
                                        },
                                        resetQuery: true,
                                        Buttons: [
                                            {
                                                action: 'requestBuild',
                                                attr: {
                                                    //'data-bind': 'enabled:State.Query.CMARequestForBuild.Data.isValid'
                                                    'data-bind': 'enabled:State.Query.CMADataStore.NewBuildRequestData.isValid'
                                                },
                                                text: 'form:Buttons.StartBuild',
                                                iconRequired: false
                                            }
                                        ]
                                    }
                                }
                            }
                    ]
                }
            ]
        };
    };
});