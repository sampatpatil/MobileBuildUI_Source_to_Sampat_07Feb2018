define(function () {
    return function () {
        return {
            Replace: false,
            Blocks: [
                {
                    ExClass: 'BuildHistoryWindow',
                    KeyTitle: 'sections.buildHistory.title',
                    Widget: {
                        Type: 'APWindow',
                        Config: {
                            AutoOpen: true,
                            modal: true,
                            width: 600,
                            resizable: false,
                            draggable: false
                        }
                    },
                    Blocks: [
                        {
                            ExtraClass: 'TitleHeaderContainer',
                            Fields: [
                                {
                                    Class: 'TitleHeader',
                                    Text: 'sections.buildHistory.contentTitle'
                                },
                                {
                                    Class: 'TitleHeader',
                                    BindPath: 'State.Query.CMADataStore.ActiveAppMetaData.AppDisplayName'
                                }
                            ]
                        },
                        {
                            Name: 'BuildHistory',
                            ExClass: 'BuildHistory',
                            Widget: {
                                Type: 'APListView',
                                QueryId: 'CMAGetBuildHistory',
                                Config: {
                                    template: {
                                        Path: 'apps/cma/content/sections/myApps/buildHistory'
                                    },
                                    resetQuery: true
                                }
                            }
                        }
                    ]
                }
            ]
        };
    };
});