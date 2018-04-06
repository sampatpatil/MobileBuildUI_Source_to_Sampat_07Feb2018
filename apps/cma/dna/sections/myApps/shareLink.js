define(function () {
    return function () {
        return {
            Replace: false,
            Blocks: [
                {
                    ExClass: 'ShareLinkWindow',
                    KeyTitle: 'sections.shareLink.title',
                    Widget: {
                        Type: 'APWindow',
                        Config: {
                            AutoOpen: true,
                            modal: true,
                            resizable: false,
                            draggable: false
                        }
                    },
                    Blocks: [
                        {
                            Name: 'ShareLink',
                            ExClass: 'ShareLink',
                            Widget: {
                                Type: 'APForm',
                                QueryId: 'CMAShareLink',
                                Config: {
                                    FormTemplate: {
                                        Path: 'apps/cma/content/sections/myApps/shareLink'
                                    },
                                    Buttons: [
                                            {
                                                action: 'sendEmail',
                                                //attr: {
                                                //    'data-bind': 'enabled:State.Query.CMAShareLink.Data.To'
                                                //},
                                                text: 'form:Buttons.Share',
                                                iconRequired: false,
                                                enabled: true,
                                                showText: true
                                            }
                                    ]
                                }
                            }
                        }
                    ]
                }
            ]
        };
    };
});