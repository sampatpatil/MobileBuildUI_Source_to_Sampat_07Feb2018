define(function () {
    return function (Args) {
        var isSessionEstablish = false, AP = Args.AP;
        if (AP != undefined && AP.Config.isSessionValid()) {
            isSessionEstablish = true;
        };

        // Page disabled, hence route to my apps always.
        AP.Controller.route('go/sections/myApps');
        return {};

        // always route to myApps page if it's not in standalone mode.
        if (!AP.Config.Data.isStandalone) {
            AP.Controller.route('go/sections/myApps');
            return {};
        };

        // Home page design.
        return {
            Master: isSessionEstablish ? 'root' : 'home',
            Section: 'Landing',
            Replace: true,
            Blocks: [
                        {
                            ExClass: 'LandingContent',
                            Widget: {
                                Type: 'APBackground',
                                Config: {
                                    Images: [
                                        'locales/default/backgrounds/screen_lan.jpg'
                                    ],
                                    Class: 'MainBgImage'
                                }
                            },
                            Blocks: [
                                {
                                    ExClass: 'MainImage',
                                    Widget: {
                                        Type: 'APImage',
                                        Data: {
                                            Src: 'banner/marketbanner3.png'
                                        }
                                    }
                                }
                            ]
                        }
            ]
        }
    }


});