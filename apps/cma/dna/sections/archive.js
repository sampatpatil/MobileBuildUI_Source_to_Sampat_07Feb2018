define(function () {

    return function (Args) {
        // App list page design.
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
                    ExBlocksClass: 'MyAppsContainer',
                    Blocks: [
                        'sections/myApps/archiveList'
                    ]
                }
            ]
        }
    }

    /*return function (Args) {
        return {
            Master: 'root',
            Blocks: [
                {
                    ExBlocksClass: 'MyAppsContainer',
                    Replace: true,
                    Blocks: [
                        {
                            Blocks: [
                                {
                                    ExBlocksClass: 'TrashList',
                                    Blocks: [
                                        {
                                            Class:'TitleBlock',
                                            Fields: [
                                                {
                                                    Class: 'TitleHeader',
                                                    Text: 'sections.trash.title'
                                                }
                                            ]
                                        },
                                        {
                                            Name: 'TrashList',
                                            ExClass: 'TrashListContainer',
                                            Widget: {
                                                Type: 'APListView',
                                                QueryId: 'CMAGetTrashedApps',
                                                Config: {
                                                    template: {
                                                        Path: 'apps/cma/content/sections/myApps/trashListItem'
                                                    },
                                                    selectable: false,
                                                    customScroll: true
                                                }
                                            }
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    }*/
});