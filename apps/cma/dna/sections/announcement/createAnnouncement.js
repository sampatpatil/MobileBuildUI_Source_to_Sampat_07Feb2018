define(function () {
    return function (Args) {
        return {
            Master: 'root',
            accessCode: 'SysAdmin',
            Blocks: [
                {
                    ExBlocksClass: 'MyAppsContainer',
                    Blocks: [
                         {
                             Name: 'NewAnnouncement',
                             ExClass: 'NewAnnouncement',
                             Widget: {
                                 Type: 'APForm',
                                 QueryId: 'CMACreateEditAnnouncement',
                                 Config: {
                                     FormTemplate: {
                                         Path: 'apps/cma/content/sections/announcement/createEditAnnouncement'
                                     },
                                     resetQuery: true,
                                     Buttons: [
                                         {
                                             accessCode: 'SysAdmin',
                                             action: 'Create',
                                             enabled: true,
                                             iconRequired: false,
                                             showText: true,
                                             text: 'Create'
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