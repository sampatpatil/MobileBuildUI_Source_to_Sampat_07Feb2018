define(['ap/modules/controller/accessrightshandler'], function (baseACRhandlers) {
    return function (AP) {
        var AccessRightsHandler = baseACRhandlers.extend({
            canNavigate: function (path, next) {
                var me = this;
                AP.Model.fetchDNA({
                    Path: path
                }, function (dna) {
                    var block = dna({
                        AP: AP,
                        parameters: {}
                    });
                    me.checkRights(block.accessCode, next);
                });

            },
            canRenderBlock: function (moduleAccessCode, next) {
                return this.checkRights.apply(this, arguments);
            },
            canExecute: function (moduleAccessCode, next) {
                return this.checkRights.apply(this, arguments);
            },
            checkRights: function (moduleAccessCode, next) {
                if (!moduleAccessCode || this.getCurrentUserType().toLowerCase() === moduleAccessCode.toLowerCase()) {
                    next({
                        result: true,
                        message: ''
                    });
                }
                else {
                    next({
                        result: false,
                        message: AP.View.Internationalize.translate('accessrights.denyAction')
                    });
                };
            },
            getCurrentUserType: function () {
                return AP.Config.Data.UserData.UserType;
            }
        });

        return AccessRightsHandler;
    };
});