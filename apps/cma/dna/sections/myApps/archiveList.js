define(function () {

    return function (Args) {
        // App list Contents.
        return {
            Replace: false,
            Blocks: [
                {
                    ExClass: 'MyAppListContainerMainBlock',
                    ExBlocksClass: 'MyAppListContainerBlocks',
                    Blocks: [
                        {
                            ExBlocksClass: 'MyAppList',
                            Blocks: [
                                {
                                    Fields: [
                                        {
                                            Class: 'TitleHeader',
                                            Text: 'sections.trash.title'
                                        }
                                    ]
                                },
                                {
                                    Name: 'TrashList',
                                    ExClass: 'MyAppListContainer',
                                    Widget: {
                                        Type: 'APListView',
                                        QueryId: 'CMAGetTrashedApps',
                                        Config: {
                                            template: {
                                                Path: 'apps/cma/content/sections/myApps/archiveListItem'
                                            },
                                            animateItems: false, // Set true to animate list view items.
                                            selector: '.box',   // css selector for selecting items which are to be animated.
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
    }
});