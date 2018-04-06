define([], function () {
    var baseAccessRightsModel = kendo.Class.extend({
        onInit: function ()  {
        },
        onLogOut: function () {

        },
        onSessionExpired: function () {

        },
        checkRights: function (moduleAccessCode, next) {
            next({ result: true });
        },
        canNavigate: function (moduleAccessCode, next) {

            next({ result: true });
        },
        canRenderBlock: function (moduleAccessCode, next) {

            next({ result: true });
        },
        canExecute: function (moduleAccessCode, next) {
            next({ result: true });
        }
    });

    return baseAccessRightsModel;
});