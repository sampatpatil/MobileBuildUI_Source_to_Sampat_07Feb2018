define(['ap/modules/utils'], function (utils) {
    return function (args) {
        var buildLink = function (text, link, target) {
            return {
                text: utils.createLocaleProperty("value", text, false),
                Attr: {
                    href: link,
                    Target: target || '_blank'
                }
            };
        },
            
            pageBlock = [{
                Class: 'Body Landing',
                DOM: 'section',
                Blocks: [
                    {
                        Class: 'Content'
                    }]
            }];

        args.AP.Config.Data.isStandalone && pageBlock.push({
            Class: 'UpperBar',
            DOM: 'header',
            Blocks: [
                {
                    Class: 'Logo',
                    Widget: {
                        Type: 'APImage',
                        Data: {
                            Src: 'img.logos.AP.logo01'
                        }
                    }
                },
                {
                    Fields: [
                        {
                            Class: 'TitleHeader',
                            Text: 'app.appTitle'
                        }
                    ]
                },
                //{
                //    Type: 'List',
                //    Name:'HomeMenuBar',
                //    Widget: {
                //        Type: 'APMenu',
                //        Config: {
                //            orientation: 'horizontal',
                //            hoverDelay: 400,
                //            collapsible: false
                //        }
                //    },
                //    Blocks: [
                //    {
                //        Class: 'Menu',
                //        Fields: [{ DOM: 'a', Attr: { href: '#sections/home' },
                //            Fields: [{ Class: 'Title MenuText', Text: 'Home' }]
                //        }]
                //    },
                //     {
                //         Class: 'Signin',
                //         Fields: [{ DOM: 'a', Attr: { href: '#menu/signin' }, Fields: [{ Class: 'Title MenuText', Text: 'Sign in' }] }]
                //     }
                //    ]
                //}
            ]
        });

        // Master page design for unauthorised users.
        return {
            Class: 'CMAMain',
            IsMaster: true,
            Blocks: [
                {
                    Class: 'Root',
                    ExClass: 'Home',
                    //Widget: {
                    //    Type: 'APBackground',
                    //    Config: {
                    //        Images: [
                    //            'locales/default/backgrounds/signup-bg.png'
                    //        ],
                    //        Class: 'MainBgImage'
                    //    }
                    //},
                    Blocks: pageBlock
                },
                {
                    Class: 'Footer',
                    Fields: [
                        {
                            DOM: 'div',
                            Fields: [
                                {
                                    Class: 'FooterText',
                                    Text: 'footer.title',
                                    Bindings: [
                                        {
                                            text:'State.Query.CMADataStore.Footer'
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        };
    };
});