define([], function () {
    return function (Args) {
        Args = Args || { MaxTicks: 120 };

        // Design for session extender window.
        return {
            Replace: false,
            Blocks: [
                {
                    Class: 'Window',
                    KeyTitle: 'sections.sessionextender.windows.title',
                    Widget: {
                        Type: 'APWindow',
                        QueryId: 'CMADataStore',
                        Config: {
                            resizable: false,
                            modal: true,
                            AutoOpen: true,
                            width: '40%',
                            actions: ['Close']
                        }
                    },
                    Blocks: [
                        {
                            Class: 'SessionExtenderTimer',
                            Widget: {
                                Type: 'APTimer',
                                Config: {
                                    maxTicks: Args.MaxTicks || 120,
                                    QueryId: 'CMADataStore',
                                    PropPath: 'Session.Extender.Interval'
                                }
                            },
                            Template: { Path: 'apps/cma/content/templates/info/sessionmessage' }
                        },
                    {
                        Class: 'SessionExtenderActions',
                        Widget: {
                            Type: 'APForm',
                            Config: {
                                Buttons: [{
                                    action: 'extend',
                                    enabled: true,
                                    text: 'sections.sessionextender.windows.extend',
                                    iconClass: "k-i-tick",
                                    iconRequired: false
                                }, {
                                    action: 'cancel',
                                    enabled: true,
                                    text: 'sections.sessionextender.windows.cancel',
                                    iconClass: "k-cancel",
                                    iconRequired: false
                                }]
                            }
                        }
                    }]
                }]
        }
    };
});