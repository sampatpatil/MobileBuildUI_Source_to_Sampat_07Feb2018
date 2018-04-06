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
                                // {
                                //     Fields: [
                                //         {
                                //             Class: 'TitleHeader',
                                //             Text: 'sections.appList.title'
                                //         },
                                //         {
                                //             Class: '',
                                //             Text: '',
                                //             Bindings: [{text:'State.Query.CMAGetCustomizedApps.Data.appList.length'}]
                                //         }
                                //     ]
                                // },
                                {
                                    Name: 'AppList',
                                    ExClass: 'MyAppListContainer',
                                    Widget: {
                                        Type: 'APListView',
                                        QueryId: 'CMAGetCustomizedApps',
                                        Config: {
                                            template: {
                                                Path: 'apps/cma/content/sections/myApps/appListItem'
                                            },
                                            animateItems: true, // Set true to animate list view items.
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