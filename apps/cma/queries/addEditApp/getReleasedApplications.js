define([], function () {
    var Id = 'CMAGetReleasedApplications';

    var getReleasedApplications = {
        Id: Id,
        vm: function (AP) {
            return {
                Id: Id,
                QueryMethod: 'GetTextData/{0}',
                QueryType: 'GET',
                QueryJsonData: '',
                usePortalUrl: false,
                generateQuery: function () {
                    this.QueryMethod = kendo.format(this.QueryMethod, 'ApplicationList_' + AP.Config.Data.UserData.Username.replace(/\\/g, '_'));
                },
                DataSource: {
                    pageSize: 400,
                    sort: { field: "Value", dir: "asc" },
                    schema: {
                        parse: function (response) {
                            var data = null,
                                appList = null;

                            try {
                                appList = JSON.parse(response.TextData).ApplicationList;
                            } catch (e) {
                                appList = [];
                            }
                            var data = _.chain(appList).pluck('Value').unique().map(function (value, key) {
                                return { Value: value, isChecked: false };
                            }).value();

                            return AP.Utils.getJsonformatteddata(Id, data);
                        }
                    }
                }
            }
        }
    };

    return getReleasedApplications
});