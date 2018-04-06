define([], function () {
    // Query to get a customized app list. This query will be changed. It is used only for testing purpose.
    var Id = 'CMAGetCustomizedApps',
        GetCustomizedApps = {
            Id: Id,
            vm: function (AP) {
                return {
                    Id: Id,
                    QueryMethod: 'GetMobileApps',
                    QueryType: 'GET',
                    QueryJsonData: '',
                    generateQuery: function () {

                    },
                    Data: {
                        appList: []
                    },
                    Message: {
                        Key: "api:query.success",
                        Values: ""
                    },
                    DataSource: {
                        schema: {
                            data: function (res) {
                                $.each(res, function () {
                                    this.AppCreatedDate = this.AppCreatedDate.replace(/\//g, '\/');
                                    this.AppLastModifiedDate = this.AppLastModifiedDate.replace(/\//g, '\/');
                                    this.AppLockedDate = this.AppLockedDate.replace(/\//g, '\/');
                                    this.AppLogoURL = AP.Utils.path.join(AP.Config.Data.APIUrl, 'GetAppLogo/' + this.AppId);
                                });
                                //res.unshift({ Name: 'AddNewApp' }); //hide Create new app button on MyApps tile list -- Phani
                                if(res.length === 0) res = "+"; //provide a single character string so that only one 'create new app' tile is displayed.
                                AP.Config.loadQuery(Id).set('Data.appList', res);
                                return res;
                            }
                        }
                    }
                };
            }

        };

    return GetCustomizedApps;
});