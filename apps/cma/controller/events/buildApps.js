define(function () {
    var buildAppsEvents = {
        BuildRequestForm: {
            init: function (args) {
                var AP = this.App,
                    vm = AP.Config.loadQuery(this.widget.QueryId).get('Data'),
                    selectedAppVm = AP.Config.loadQuery('CMAAddOrEditApp').get('Form');

                vm.set('Android.isAvailable', selectedAppVm.get('PlatformSelector.CreateAndroidApp'));
                vm.set('iOS.isAvailable', selectedAppVm.get('PlatformSelector.CreateiPhoneAndiPadApp'));
                vm.set('Windows.isAvailable', selectedAppVm.get('PlatformSelector.CreateWindowsPhoneApp'));
            },
            requestBuild: function (args) {
                var AP = this.App,
                    //vm = AP.Config.loadQuery(this.widget.QueryId).get('Data'), //this is the view model for the earlier call where data was coming from 'CMARequestForBuild'
                    vm = AP.Config.loadQuery('CMADataStore').get('NewBuildRequestData'),
                    selectedAppVm = AP.Config.loadQuery('CMAAddOrEditApp').get('Form'),
                    controlsVm = selectedAppVm.parent().get('Controls'),
                    selectedPlatforms = [];

                $.each(vm, function (key) {
                    if (this.isAvailable && this.selectedToBuild) {
                        selectedPlatforms.push(key);
                    };
                });

                AP.View.Waiting.show();
                AP.Controller.route('action/BuildApps/createMobileBuild', {
                    selectedPlatforms: selectedPlatforms,
                    selectedAppData: selectedAppVm,
                    success: function () {
                        var parentWindow = $(args.e.currentTarget).closest('.APWindow').data('APWidget');

                        AP.Controller.route('action/BuildApps/loadBuildStatus', {
                            vm: selectedAppVm.parent(),
                            success: function () {
                                AP.View.Waiting.hide();
                            },
                            error: function () {
                                AP.View.Waiting.hide();
                            }
                        });

                        parentWindow && parentWindow.KendoWidget.close();
                    },
                    error: function () {
                        AP.View.Waiting.hide();
                    }
                });
            }
        }
    };

    return buildAppsEvents;
});