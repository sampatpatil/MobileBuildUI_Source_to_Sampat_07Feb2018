define([], function () {
    // Query to store custom data.
    var Id = 'CMACreateEditAnnouncement';
    var DataStore = {
        Id: Id,
        vm: function (AP) {
            var today = new Date();
            var data = {
                Form: {
                    announcement: {
                        Id: '',
                        Title: '',
                        SubTitle: (today.getMonth()+1)+'/'+today.getDate()+'/'+today.getFullYear(),
                        DeviceType:'',
                        ReleaseAndroidApp: false,
                        ReleaseiOSApp: false,
                        ReleaseWindowsApp: false,
                        Content: '',
                        Category: '',
                        Status: 0
                    }
                },
                Data: {
                    DeviceTypeList: ['Android', 'iOS', 'Windows'],
                    StatusSource: [
                        {
                            text: 'Draft',
                            value: 0
                        },
                        {
                            text: 'Published',
                            value: 1
                        }
                    ]
                }
            };
            return data;
        }
    };
    return DataStore;
});