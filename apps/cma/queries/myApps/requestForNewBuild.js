define([], function () {
    var Id = 'CMARequestForBuild',
        RequestForBuild = {
            Id: Id,
            vm: function (AP) {
                return {
                    Id: Id,
                    Data: {
                        Android: {
                            isAvailable: false,
                            selectedToBuild:false
                        },
                        iOS: {
                            isAvailable: false,
                            selectedToBuild: false
                        },
                        Windows: {
                            isAvailable: false,
                            selectedToBuild: false
                        },
                        isValid: function () {
                            return this.get('Android.selectedToBuild') || this.get('iOS.selectedToBuild') || this.get('Windows.selectedToBuild');
                        }
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