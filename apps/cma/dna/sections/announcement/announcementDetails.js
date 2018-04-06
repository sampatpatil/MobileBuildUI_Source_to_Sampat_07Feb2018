define(function () {
    return function () {
        return {
            Replace: false,
            Blocks: [
                {
                    ExClass: 'AnnouncementDetailsWindow',
                    KeyTitle: 'sections.announcement.announcementDetails.windowTitle',
                    Widget: {
                        Type: 'APWindow',
                        Config: {
                            AutoOpen: true,
                            modal: true,
                            resizable: false,
                            draggable: false,
                            width: 600
                        }
                    },
                    Blocks: [
                        {
                            ExClass: 'AnnouncementDetails',
                            Widget: {
                                Type: 'APForm',
                                QueryId: 'CMADataStore',
                                Config: {
                                    FormTemplate: {
                                        Path: 'apps/cma/content/sections/announcement/announcementDetails'
                                    }
                                }
                            }
                        }
                    ]
                }
            ]
        };
    };
});