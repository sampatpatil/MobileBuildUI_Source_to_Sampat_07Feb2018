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
                // {
                //     Class: 'TitleHeader',
                //     Fields: [
                //         {
                //             Class: '',
                //             Text: 'app.appTitle'
                //         }
                //     ]
                // },
                {
                    Name: 'ProfileMenu',
                    Class: 'LogOut',
                    Widget: {
                        Type: 'APProfileMenu',
                        Template: {
                            Path: 'apps/cma/content/templates/menu/profilemenu'
                        },
                        Config: {
                            TargetSelector: '.LoginUserInfo',
                            OpenClass: 'Opened',
                            MenuItems: [
                                //{
                                //    Text: 'sections.settings.title',
                                //    Action: 'loadSettingsPage'
                                //},
                                {
                                    Text: 'sections.changePassword.title',
                                    Action: 'loadChangePasswordPage'
                                },
                                {
                                    Text: 'sections.settings.title',
                                    Action: 'loadSettingsPage'
                                },
                                {
                                    Text: 'sections.signout',
                                    Action: 'logout'
                                }
                            ]
                        }
                    }

                },
                {
                    Type: 'List',
                    Name: 'MainMenuList',
                    Widget: {
                        Type: 'APMenu',
                        Config: {
                            orientation: 'horizontal',
                            hoverDelay: 400,
                            collapsible: false
                        }
                    },
                    Blocks: [
                       {
                            Class: 'Menu',
                            Fields: [
                                {
                                    Class: 'Title Welcome',
                                    DOM: 'a', Attr: { href: '#sections/Welcome' },
                                    Fields: [

                                        { Class: 'Title MenuText', Text: 'menu.welcometext' }
                                    ]
                                }
                            ]
                        },

                      
                        {
                            Class: 'Menu',
                            Fields: [
                                {
                                    Class: 'Title MyApps',
                                    DOM: 'a', Attr: { href: '#sections/myApps' },
                                    Fields: [

                                        { Class: 'Title MenuText', Text: 'menu.myApps' }
                                    ]
                                }
                            ]
                        },
                        {
                            Class: 'Menu',
                            Fields: [
                                {
                                    Class: 'Title CreateNewApp',
                                    DOM: 'a', Attr: { href: '#sections/addApp/addNewApp' },
                                    Fields: [

                                        { Class: 'Title MenuText', Text: 'menu.createNewApp' }
                                    ]
                                }
                            ]
                        },
                        {
                            Class: 'Menu',
                            Fields: [
                                {
                                    Class: 'Title Archive',
                                    DOM: 'a', Attr: { href: '#sections/archive' },
                                    Fields: [

                                        { Class: 'Title MenuText', Text: 'menu.archive' }
                                    ]
                                }
                            ]
                        },
                        {
                            Class: 'Menu',
                            accessCode: 'SysAdmin',
                            Fields: [
                                {
                                    Class: 'Title Announcement',
                                    DOM: 'a', Attr: { href: '#sections/announcements' },
                                    Fields: [
                                        {
                                            Class: 'Title MenuText',
                                            Text: 'menu.announcements'
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        });

        args.AP.Config.Data.isStandalone && pageBlock[0].Blocks.unshift({
            Type: 'Toolbar',
            Name: 'Toolbar',
            Widget: {
                Type: 'APTemplatedWidget',
                Config: {
                    template: {
                        Path: 'apps/cma/content/sections/toolbar'
                    }
                }
            },
        });

        // Master page design for authorised users.
        return {
            Class: 'CMAMain',
            IsMaster: true,
            Blocks: [
                {
                    Class: 'Root',
                    ExClass: 'Home',
                    Widget: {
                        Type: 'APBackground',
                        Config: {
                            Images: [
                                'locales/default/backgrounds/signup-bg.png'
                            ],
                            Class: 'MainBgImage'
                        }
                    },
                    Blocks: pageBlock
                },
                {
                    Class: 'Footer',
                    Fields: [
                        {
                            Class: 'FooterText',
                            Text: 'footer.title',
                            Bindings: [
                                {
                                    text: 'State.Query.CMADataStore.Footer'
                                }
                            ]
                        }
                    ]
                }
            ]
        };
    };
});