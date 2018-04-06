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
                        this.QueryMethod = kendo.format(this.QueryMethod, AP.Config.loadQuery('CMADataStore').get('ActiveAppMetaData.AppBaseId') || location.href.split('(')[1].split(')')[0]);
                        //console.log(this.QueryMethod);
                    },
                    Message: {
                        Key: "api:query.success",
                        Values: ""
                    },
                    DataSource: {
                        schema: {
                            data: function (res) {
                                buildCount = 0;
                                data = _.chain(res.buildHistory).map(function (buildData) {
                                    return {
                                        AppId: buildData.id,
                                        AppVersion: buildData.appVersion,
                                        BuildHistory: _.chain(buildData.build)
                                                /*.groupBy('AppBuildVersion')*/
                                                .map(function (items) {
                                                    var obj = {
                                                        Version: items.version,
                                                        Date: items.date,
                                                        RequestedBy: items.requestedBy || '',
                                                        Builds: items.apps,
                                                        BuildRequestId: {
                                                        }
                                                    };
                                                    buildCount++

                                                    items.apps.forEach(function (item) {
                                                        item.type && (obj.BuildRequestId[item.type] = item.status > 3 ? item.id : 'Disabled');
                                                    });

                                                    return obj;
                                                })/*.sortBy(function (item) {
                                                    try {
                                                        return Number(item.Version);
                                                    } catch (e) {
                                                        return item.Version;
                                                    };
                                                }).reverse()*/.value()
                                    };
                                })/*.sortBy(function (buildData) {
                                    try {
                                        return Number(buildData.AppVersion);
                                    } catch (e) {
                                        return buildData.AppVersion;
                                    };
                                }).reverse()*/.value();
                                //console.log(data);
                                if (buildCount>0) {
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