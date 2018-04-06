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
                    ExBlocksClass: '',
                    Blocks: [
                        'sections/myApps/userSettingsList'
                    ]
                }
            ]
        }
    }

});