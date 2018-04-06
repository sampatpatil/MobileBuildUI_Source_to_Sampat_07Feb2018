define(function () {
    return {
        AnnouncementList: {
            init: function (args) {
                var AP = this.App,
                    dataSource = AP.Config.loadQuery('CMADataStore').get('Announcements.allNotifications').toJSON();
                
                this.widget.setData(dataSource);
            },
            CreateAnnouncement: function (args) {
                this.App.Controller.route('go/sections/announcement/createAnnouncement');
            },
            EditSelected: function (args) {
                var AP = this.App,
                    vm = AP.Config.loadQuery('CMACreateEditAnnouncement').get('Form'),
                    selectedItems = this.widget.getSelectedItems();

                if (!selectedItems.length) return;

                vm.set('announcement', selectedItems[0]);
                this.App.Controller.route('go/sections/announcement/editAnnouncement');
            },
            PublishSelected: function (args) {
            },
            UnpublishSelected: function (args) {
            }
        },
        NewAnnouncement: {
            Create: function (args) {
                var AP = this.App;

                AP.View.Waiting.show();
                AP.Controller.route('action/Announcements/createAnnouncement', {
                    success: function (res) {
                        AP.View.showAlertKey(res.SaveNotificationResult ? 'Announcement created successfully.' : 'Failed to create announcement.');
                        AP.View.Waiting.hide();
                        AP.Controller.route('action/Announcements/getAnnouncements', {});
                        AP.Controller.route('go/sections/announcements');
                    },
                    error: function () {
                        AP.View.Waiting.hide();
                    }
                });
            }
        },
        EditAnnouncement: {
            Update: function (args) {
                var AP = this.App;

                AP.View.Waiting.show();
                AP.Controller.route('action/Announcements/updateAnnouncement', {
                    success: function (res) {
                        AP.View.showAlertKey(res.UpdateNotificationResult ? 'Announcement updated successfully.' : 'Failed to update announcement.');
                        AP.View.Waiting.hide();
                        AP.Controller.route('action/Announcements/getAnnouncements', {});
                        AP.Controller.route('go/sections/announcements');
                    },
                    error: function () {
                        AP.View.Waiting.hide();
                    }
                });
            }
        },
    };
});