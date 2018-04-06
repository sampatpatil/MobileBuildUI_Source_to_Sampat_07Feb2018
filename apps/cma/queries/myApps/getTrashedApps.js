define([], function () {
    // Query to get a customized app list. This query will be changed. It is used only for testing purpose.
    var Id = 'CMAGetTrashedApps',
        GetCustomizedApps = {
            Id: Id,
            vm: function (AP) {
                return {
                    Id: Id,
                    QueryMethod: 'GetTrashedApplications',
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
                                res = res.GetTrashedApplicationsResult;

                                res = _.chain(res).each(function (item) {
                                    item.AppCreatedDate = item.AppCreatedDate.replace(/\//g, '\/');
                                    item.AppLastModifiedDate = item.AppLastModifiedDate.replace(/\//g, '\/');
                                    item.AppLockedDate = item.AppLockedDate.replace(/\//g, '\/');
                                    item.AppLogoURL = AP.Utils.path.join(AP.Config.Data.APIUrl, 'GetAppLogo/' + item.AppId);
                                }).sortBy(function (item) {
                                    return item.AppDisplayName.toLowerCase();
                                }).value();
                                if (res.length === 0) res.unshift({ Status: 'ArchiveEmpty' });
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