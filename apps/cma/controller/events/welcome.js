define(function () {
        var welcomeEventHandlers = {
            Welcome:{
                init: function(Args){
                    //console.log('inited');
                    var me = this;
                    var AP = this.App;
                    vm = AP.Config.loadQuery('CMAGetCustomizedApps');
                    vm.generateQuery();
                    AP.Config.AjaxRequest(vm.toJSON(), {
                        success: function(r){
                            var vm = AP.Config.loadQuery('CMAGetCustomizedApps');
                            vm.set('Data.appList', r);
                        },
                        error: function(e){
                            Args.error
                        }
                    });

                    vm = AP.Config.loadQuery('CMAGetTrashedApps');
                    vm.generateQuery();
                    AP.Config.AjaxRequest(vm.toJSON(), {
                        success: function(r){
                            var vm = AP.Config.loadQuery('CMAGetTrashedApps');
                            vm.set('Data.appList', r.GetTrashedApplicationsResult);
                        },
                        error: function(e){
                            Args.error
                        }
                    })
                },
                loadMyApps: function (args) {
                    var me = this;
                    AP = me.App;
                    AP.Controller.route('go/sections/myApps');
                },
                addNewApp: function (args) {
                    var me = this;
                    AP = me.App;
                    AP.Controller.route('go/sections/addApp/addNewApp');
                },
                loadArchive: function (args) {
                    var me = this;
                    AP = me.App;
                    AP.Controller.route('go/sections/archive');
                },
                loadAnnouncements: function (args) {
                    var me = this;
                    AP = me.App;
                    AP.Controller.route('go/sections/announcements');
                }
            }
        };
        return welcomeEventHandlers;

});