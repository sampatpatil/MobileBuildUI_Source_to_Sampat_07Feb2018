define([], function () {
    return function (Args) {

        // always route to myApps page if it's already loggedin.
        if (Args.AP.Config.isLoggedIn() || !Args.AP.Config.Data.isStandalone) {
            Args.AP.Controller.route('go/sections/myApps');
            return {};
        };

        // Login page and form design.
        return {
            Master: 'home',
            Replace: true,
            Blocks: [
                {
                    Class: 'SigninPage',
                    Blocks: [
                        {
                            ExClass: 'SignInBanner',
                            Widget: {
                                Type: 'APBackground',
                                Config: {
                                    Images: [
                                        'SignInImage.png'
                                    ],
                                    Class: 'MainBgImage'
                                }
                            }
                        },
                        {

                            Class: 'SignInContent',
                            Blocks: [
                            {
                                ExClass: 'Login-Form',
                                Class: 'Form',
                                Name: 'LoginForm',
                                Widget: {
                                    Type: 'APForm',
                                    QueryId: 'CMAGetLoginUser',
                                    Config: {
                                        resetQuery: false,
                                        Buttons: [
                                            {
                                                action: 'Login',
                                                text: 'homemetroblocks.loginmenu.buttons.login',
                                                iconRequired: false,
                                                submit: true,
                                                attr: {
                                                    'data-redirect': 'sections/myApps'
                                                }
                                            }

                                        ],
                                        Messages: [
                                            {
                                                text: 'homemetroblocks.loginmenu.buttons.login'
                                            }
                                        ]
                                    }
                                }
                            }

                            ]
                        },
                        {
                            Fields: [
                                {
                                    Class: 'AccessRequestMessage',
                                    Text: 'homemetroblocks.accessrequestmessage'
                                }
                            ]
                        },
                    ]
                }
            ]

        };
    }
});