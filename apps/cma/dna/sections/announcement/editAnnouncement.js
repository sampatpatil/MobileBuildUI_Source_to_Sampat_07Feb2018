define(function () {
    return function (Args) {
        if (!Args.AP.Config.loadQuery('CMACreateEditAnnouncement').get('Form.announcement.Id')) {
            Args.AP.Controller.route('go/sections/announcements');
            return {};
        };

        return {
            Master: 'root',
            accessCode: 'SysAdmin',
            Blocks: [
                {
                    Blocks: [
                         {
                             Name: 'EditAnnouncement',
                             ExClass: 'NewAnnouncement',
                             Widget: {
                                 Type: 'APForm',
                                 QueryId: 'CMACreateEditAnnouncement',
                                 Config: {
                                     FormTemplate: {
                                         Path: 'apps/cma/content/sections/announcement/createEditAnnouncement'
                                     },
                                     Buttons: [
                                         {
                                             accessCode: 'SysAdmin',
                                             action: 'Update',
                                             enabled: true,
                                             iconRequired: false,
                                             showText: true,
                                             text: 'Update'
                                         }
                                     ]
                                 }
                             }
                         }
                    ]
                }
            ]
        }
    }

});