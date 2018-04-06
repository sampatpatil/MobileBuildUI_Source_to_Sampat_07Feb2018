define([], function () {
    var Id = 'CMAShareLink',
        RequestForBuild = {
            Id: Id,
            vm: function (AP) {
                return {
                    Id: Id,
                    Data: {
                        AppName: '',
                        Platform: '',
                        AppVersion: '',
                        BuildRequestId: '',
                        To: ''
                    },
                    Message: {
                        Key: "api:query.success",
                        Values: ""
                    }
                };
            }

        };

    return RequestForBuild;
});