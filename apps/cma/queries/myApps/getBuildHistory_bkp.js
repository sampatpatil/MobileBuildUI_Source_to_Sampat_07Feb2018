define([], function () {
    // Query to get a customized app list. This query will be changed. It is used only for testing purpose.
    var Id = 'CMAGetBuildHistory',
        GetCustomizedApps = {
            Id: Id,
            vm: function (AP) {
                return {
                    Id: Id,
                    QueryMethod: 'GetBuildHistory/{0}',
                    QueryType: 'GET',
                    QueryJsonData: '',
                    generateQuery: function () {
                        this.QueryMethod = kendo.format(this.QueryMethod, AP.Config.loadQuery('CMADataStore').get('ActiveAppMetaData.AppBaseId'));
                    },
                    Message: {
                        Key: "api:query.success",
                        Values: ""
                    },
                    DataSource: {
                        schema: {
                            data: function (res) {
                                var data = _.chain(res.GetBuildHistoryResult).map(function (buildData) {
                                    return {
                                        AppId: buildData.AppId,
                                        AppVersion: buildData.AppVersion,
                                        BuildHistory: _.chain(buildData.BuildHistory)
                                                .groupBy('AppBuildVersion')
                                                .map(function (items, version) {
                                                    var obj = {
                                                        Version: version,
                                                        BuildRequestId: {
                                                        }
                                                    };

                                                    items.forEach(function (item) {
                                                        item.AppType && (obj.BuildRequestId[item.AppType] = item.BuildStatus > 3 ? item.BuildRequestId : 'Disabled');
                                                    });

                                                    return obj;
                                                }).sortBy(function (item) {
                                                    try {
                                                        return Number(item.Version);
                                                    } catch (e) {
                                                        return item.Version;
                                                    };
                                                }).reverse().value()
                                    };
                                }).sortBy(function (buildData) {
                                    try {
                                        return Number(buildData.AppVersion);
                                    } catch (e) {
                                        return buildData.AppVersion;
                                    };
                                }).reverse().value();

                                if (data.length) {
                                    data.unshift({ isHeader: true });
                                }
                                else {
                                    data.unshift({ isEmpty: true });
                                };

                                return data;
                            }
                        }
                    }
                };
            }

        };

    return GetCustomizedApps;
});