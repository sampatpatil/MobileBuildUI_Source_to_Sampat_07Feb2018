define(['ap/modules/controller/interceptor'], function (baseInterceptor) {
    return function (AP) {
        var interceptors = [];

        var getBlockIds = function (classPathCollection) {
            if (classPathCollection.length < 1) return [];
            return _.map(classPathCollection, function (clp) { var obj = { detailBlockId: '' }; obj.detailBlockId = AP.Utils.getBlockIdFromClassPath(clp); return obj; })
        },
            removeBlocks = function (detailBlockIds) {
                _.each(detailBlockIds, function (b) {
                    if (b.detailBlockId) {
                        AP.View.removeBlock(b.detailBlockId, true);
                        AP.Model.removeBlock(b.detailBlockId);
                    }

                });
            };



        /****************************** Specify all the Class Holder Path  for each module***********************************/

        var loginInterceptor = baseInterceptor.extend({
            path: 'menu/signin',

            onNavigatingFrom: function (Args) {
                var parameters = Args.parameters, from = Args.from, to = Args.to;
                if (parameters.length > 0) {
                    var auth = parameters[0];
                    var username = parameters[1];
                    var fullname = parameters[2];

                    AP.Config.setUserAuthentication(auth, username, fullname);

                    AP.Controller.route('go/menu/signin');
                }
                Args.next();
            }
        }),
            announcementListInterceptor = baseInterceptor.extend({
                path: 'sections/announcements',

                onNavigatingFrom: function (Args) {
                    AP.View.Waiting.show();
                    AP.Controller.route('action/Announcements/getAllAnnouncements', {
                        success: function (res) {
                            Args.next();
                            AP.View.Waiting.hide();
                        },
                        error: function (e) {
                            AP.View.showAlertKey(e.message);
                            AP.Controller.route('go/sections/myapps');
                            AP.View.Waiting.hide();
                        }
                    });
                }
            });

        interceptors.push(loginInterceptor);
        interceptors.push(announcementListInterceptor);

        return interceptors;
    };


});