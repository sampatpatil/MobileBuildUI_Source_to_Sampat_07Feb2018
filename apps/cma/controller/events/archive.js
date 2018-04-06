define(function () {
    var commandHandlers = {
        Restore: function (args) {
            var me = this,
                AP = me.App;
                
            AP.View.confirmKey('Restore this app?', [{ text: 'Yes' }, { text: 'No' }]).Yes(function () {
                AP.View.Waiting.show();
                AP.Controller.route('action/Archive/trashOrRestoreApplication', {
                    AppId: args.rowData.AppId,
                    Status: 4,
                    success: function (res) {
                        if (!res || !res.TrashOrRestoreApplicationResult) {
                            AP.View.showAlertKey('Unable to restore application from archive. Please check console for more details.');
                        };
                        AP.View.Waiting.hide();
                        me.widget.refresh();
                    },
                    error: function () {
                        AP.View.Waiting.hide();
                    }
                });
            });
        }
    },
    trashListHandlers = {
        TrashList: {
            init:function () {
                //this.App.View.Waiting.show();
            },
            command: function (args) {
                args.command && commandHandlers[args.command] && (commandHandlers[args.command].call(this, args), (args.handled = true));
            },
            databound: function () {
                //this.App.View.Waiting.hide();
            }
        }
    };

    return trashListHandlers;
});