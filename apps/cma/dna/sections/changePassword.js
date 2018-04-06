define(function () {
    return function (Args) {
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
                             Name: 'ChangePassword',
                             ExClass: 'ChangePassword',
                             Widget: {
                                 Type: 'APTemplatedWidget',
                                 Config: {
                                     template: {
                                         Path: 'apps/cma/content/sections/changePassword'
                                     },
                                 }
                             }
                         }
                    ]
                }
            ]
        }
    }

});