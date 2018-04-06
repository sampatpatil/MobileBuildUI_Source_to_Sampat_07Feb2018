define([], function () {
    // Query to Validate Credentials.
    var GetLoginUser = {
        Id: 'CMAGetLoginUser',
        QueryMethod: 'Authenticate',
        QueryType: 'GET',
        QueryJsonData: '',
        generateQuery: function () {
            //var fields = this.Form.SubForms[0].FieldSets[0].Fields;
            //var domain = fields.Domain.defaultValue, userName = fields.UserName.defaultValue;
            //this.QueryJsonData = { userName: domain ? (domain + '\\' + userName) : userName };
        },
        ClearData: function () {
            var fields = this.Form.SubForms[0].FieldSets[0].Fields;
            //fields.set('UserName.defaultValue', '');
            //fields.set('Domain.defaultValue', '');
            fields.set('StaySignedIn.defaultValue', false);
            fields.set('Password.defaultValue', '');
        },
        Form: {
            SubForms: [
                {
                    FieldSets: [
                        // ----------------------------------------------------------------
                        // AP Specific fields
                        {
                            Title: 'loginheader.title',
                            ExClass: 'LoginTitle',

                            Fields: {
                                Domain: {
                                    showLabel: false,
                                    defaultValue: "",
                                    size: 10,
                                    isrequestvalue: false,
                                    requestkey: '',
                                    Enabled: true,
                                    validation: {
                                        required: true
                                    }
                                },
                                UserName: {
                                    showLabel: false,
                                    defaultValue: "",
                                    size: 10,
                                    isrequestvalue: false,
                                    requestkey: '',
                                    Enabled: true,
                                    validation: {
                                        required: true
                                    }
                                },
                                Password: {
                                    showLabel: false,
                                    defaultValue: "",
                                    type: 'password',
                                    size: 10,
                                    validation: {
                                        required: true
                                    }
                                },
                                StaySignedIn: {
                                    showLabel: true,
                                    defaultValue: '',
                                    type: 'checkbox',
                                    size: 5,
                                    Selected: false
                                },
                                //RememberMe: {
                                //    type: 'static',
                                //    defaultValue: 'form:RememberMe.label',
                                //    translate: true,
                                //    size: 5
                                //}
                            }
                        }
                    ]
                }
            ]

        },
        Messages: {
            text: '',
        }
    };

    return GetLoginUser;
}
);