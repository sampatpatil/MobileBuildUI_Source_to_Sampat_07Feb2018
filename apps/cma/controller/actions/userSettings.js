define(function () {
    uploadImage = function (Args) {
        var AP = Args.AP,
            def = $.Deferred(),
            queryMethodTemplate = 'SaveBinaryData';
        AP.Config.AjaxRequest({
            QueryMethod: queryMethodTemplate,
            QueryType: 'POST',
            QueryJsonData: {
                AppId: Args.appId,
                BinaryDataAsBase64: trimBase64String(Args.imageData.Content),
                ContentType: Args.contentType,
                FileName: Args.imageName
            },
        }, {
                success: function (e) {
                    Args.imageData.set('Id', e.SaveBinaryDataResult);
                    def.resolve(e);
                },
                error: function (e) {
                    def.reject(e);
                }
            });

        return def.promise();
    }
    return {

        saveJsonList: function (Args) {
            var me = this,
                AP = Args.AP;

            AP.Config.AjaxRequest({
                QueryMethod: 'SaveTextData',
                QueryType: 'POST',
                QueryJsonData: {
                    "BinaryData": [],
                    "ContentType": "json",
                    "CreatedDate": "\/Date(" + Date.now() + ")\/",
                    "ELEMENTID": "",
                    "SecondaryReference": Args.FileName,
                    "TextData": Args.JsonString
                }
            }, {
                    success: function (response) {
                        Args.success && Args.success(response);
                    },
                    error: function (response) {
                        Args.error && Args.error(response);
                    }
                });
        },
        getJsonList: function (Args) {
            var me = this,
                AP = Args.AP;

            AP.Config.AjaxRequest({
                QueryMethod: kendo.format('GetTextData/{0}', Args.FileName),
                QueryType: 'GET',
            }, {
                    success: function (response) {
                        Args.success && Args.success(response);
                    },
                    error: function (response) {
                        Args.error && Args.error(response);
                    }
                });
        },
        deleteApplicationList: function (Args) {
            var me = this,
                AP = Args.AP;

            AP.View.Waiting.show();
            AP.Config.AjaxRequest({
                QueryMethod: kendo.format('DeleteApplicationList/{0}', Args.FileName),
                QueryType: 'POST',
            }, {
                    success: function (response) {
                        Args.success && Args.success(response);
                        AP.View.Waiting.hide();
                    },
                    error: function (response) {
                        Args.error && Args.error(response);
                        AP.View.Waiting.hide();
                    }
                });
        },
        saveUserSettings: function (Args) {
            Args.success && Args.success(true);
            var me = this;
            AP = Args.AP;
            AP.Config.AjaxRequest({
                QueryMethod: 'SaveTextData',
                QueryType: 'POST',
                QueryJsonData: {
                    "BinaryData": [],
                    "ContentType": "json",
                    "CreatedDate": "\/Date(" + Date.now() + ")\/",
                    "ELEMENTID": "",
                    "SecondaryReference": Args.FileName,
                    "TextData": JSON.stringify(Args.JsonString)
                }
            }, {
                    success: function (response) {
                        //Args.success && Args.success(response);
                    },
                    error: function (response) {
                        Args.error && Args.error(response);
                    }
                });
        },
        saveAuthenticationSettings: function (Args) {

            console.log(Args);
            Args.success && Args.success(true);
            var me = this;
            AP = Args.AP;
            AP.Config.AjaxRequest({
                QueryMethod: 'SaveTextData',
                QueryType: 'POST',
                QueryJsonData: {
                    "BinaryData": [],
                    "ContentType": "json",
                    "CreatedDate": "\/Date(" + Date.now() + ")\/",
                    "ELEMENTID": "",
                    "SecondaryReference": Args.FileName,
                    "TextData": JSON.stringify(Args.JsonString)
                }
            }, {
                    success: function (response) {
                        //Args.success && Args.success(response);
                    },
                    error: function (response) {
                        Args.error && Args.error(response);
                    }
                });
        },
        saveNotificationList: function (Args) {
            console.log(Args);
            Args.success && Args.success(true);
            var me = this;
            AP = Args.AP;
            AP.Config.AjaxRequest({
                QueryMethod: 'SaveTextData',
                QueryType: 'POST',
                QueryJsonData: {
                    "BinaryData": [],
                    "ContentType": "json",
                    "CreatedDate": "\/Date(" + Date.now() + ")\/",
                    "ELEMENTID": "",
                    "SecondaryReference": Args.FileName,
                    "TextData": JSON.stringify(Args.JsonString)
                }
            }, {
                    success: function (response) {
                        //Args.success && Args.success(response);
                    },
                    error: function (response) {
                        Args.error && Args.error(response);
                    }
                });
        },
        getCompanyDetails: function (Args) {
            var me = this,
                AP = Args.AP;
            AP.Config.AjaxRequest({
                QueryMethod: kendo.format('GetTextData/{0}', ("CompanyDetails_" + AP.Config.Data.UserData.Username.replace(/\\/g, '_'))),
                QueryType: 'GET',
            },
                {
                    success: function (response) {
                        Args.success(response);
                    },
                    error: function (response) {
                        Args.error && Args.error(response);
                    }
                });
        },
        getAuthentication: function (Args) {
            var me = this,
                AP = Args.AP;
            AP.Config.AjaxRequest({
                QueryMethod: kendo.format('GetTextData/{0}', ("AuthenticationSettings_" + AP.Config.Data.UserData.Username.replace(/\\/g, '_'))),
                QueryType: 'GET',
            },
                {
                    success: function (response) {
                        Args.success(response);
                    },
                    error: function (response) {
                        Args.error && Args.error(response);
                    }
                });
        },
        getApplicationFilterList: function (Args) {
            var me = this,
                AP = Args.AP;
            AP.Config.AjaxRequest({
                QueryMethod: kendo.format('GetTextData/{0}', ("ApplicationList_" + AP.Config.Data.UserData.Username.replace(/\\/g, '_'))),
                QueryType: 'GET',
            },
                {
                    success: function (response) {
                        Args.success(response);
                    },
                    error: function (response) {
                        Args.error && Args.error(response);
                    }
                });
        },
        getNotificationList: function (Args) {
            var me = this,
                AP = Args.AP;
            AP.Config.AjaxRequest({
                QueryMethod: kendo.format('GetTextData/{0}', ("NotificationList_" + AP.Config.Data.UserData.Username.replace(/\\/g, '_'))),
                QueryType: 'GET',
            },
                {
                    success: function (response) {
                        Args.success(response);
                    },
                    error: function (response) {
                        Args.error && Args.error(response);
                    }
                });
        },
        getGlobalXML: function (Args) {
            var me = this,
                AP = Args.AP;
            AP.Config.AjaxRequest({
                QueryMethod: kendo.format('GetTextData/{0}', ("GlobalAppImages_" + AP.Config.Data.UserData.Username.replace(/\\/g, '_'))),
                QueryType: 'GET',
            },
                {
                    success: function (response) {
                        Args.success(response);
                    },
                    error: function (response) {
                        Args.error && Args.error(response);
                    }
                });
        },
        getImageFile: function (Args) {
            var me = this,
                AP = Args.AP;
            def = $.Deferred();
            AP.Config.customAjaxRequest({
                QueryMethod: kendo.format('GetBinaryData/{0}', Args.imgID),
                QueryType: 'GET',
                contentType: 'blob'
            },
                {
                    success: function (response) {
                        var reader = new FileReader();

                        reader.onload = function (event) {
                            Args.vmUploadImages.set('Content', event.target.result);
                            Args.vmUploadImages.set('isDefaultImage', false);
                            def.resolve(true);
                        };
                        reader.readAsDataURL(response);
                    },
                    error: function (response) {
                        Args.error && Args.error(response);
                    }
                });
            return def.promise();
        },
        saveApplicationFilter: function (Args) {
            console.log(Args.JsonString);
            Args.success && Args.success(true);
            var me = this;
            AP = Args.AP;
            AP.Config.AjaxRequest({
                QueryMethod: 'SaveTextData',
                QueryType: 'POST',
                QueryJsonData: {
                    "BinaryData": [],
                    "ContentType": "json",
                    "CreatedDate": "\/Date(" + Date.now() + ")\/",
                    "ELEMENTID": "",
                    "SecondaryReference": Args.FileName,
                    "TextData": JSON.stringify(Args.JsonString)
                }
            }, {
                    success: function (response) {
                        //Args.success && Args.success(response);
                    },
                    error: function (response) {
                        Args.error && Args.error(response);
                    }
                });
        },
        saveUploadImages: function (Args) {
            console.log(Args.JsonString);
            Args.success && Args.success(true);
            //AP.View.showAlert('Data saved successfully.');
            // var me = this;
            // AP = Args.AP;
            // AP.Config.AjaxRequest({
            //     QueryMethod: 'SaveTextData',
            //     QueryType: 'POST',
            //     QueryJsonData: {
            //         "BinaryData": [],
            //         "ContentType": "json",
            //         "CreatedDate": "\/Date(" + Date.now() + ")\/",
            //         "ELEMENTID": "",
            //         "SecondaryReference": Args.FileName,
            //         "TextData": Args.JsonString
            //     }
            // }, {
            // success: function (response) {
            //     Args.success && Args.success(response);
            // }
            //     error: function (response) {
            //         Args.error && Args.error(response);
            //     }
            // });
        },
        getImages: function (Args) {
            var me = this,
                AP = Args.AP,
                imagesToBeFetched = [];

            $.each(Args.ImagesData, function (idx, imageName) {
                imagesToBeFetched.push(getImage.call(me, { imageData: this, AP: AP, data: Args.data }, imageType));
            });

            $.when.apply($, imagesToBeFetched).done(function () {
                Args.success();
            });
        },
        uploadImages: function (Args) {
            var me = this,
                AP = Args.AP,
                imagesToBeUploaded = [];
            responseIDS = '';

            $.each(Args.ImagesData, function (platform) {
                if (this.isSelected && this.isSelected()) {
                    $.each(this, function (imageType) {
                        if (platform == 'Android') {
                            $.each(this, function (androidImageType) {
                                if (this.Content && !this.isDefaultImage && this.Enabled) {
                                    imagesToBeUploaded.push(uploadImage.call(me, { imageData: this, AP: AP, imageName: platform + '_' + imageType.replace('_', '-').toLowerCase() + '_' + androidImageType, appId: Args.appId, contentType: 'png' }));
                                };
                            });
                        }
                        else if (this.Content && this.Enabled && (Args.includeOnlyChangedItems ? !this.isDefaultImage : true)) {
                            imagesToBeUploaded.push(uploadImage.call(me, { imageData: this, AP: AP, imageName: this.fileName || platform + '_' + imageType, appId: Args.appId, contentType: 'png' }));
                        };
                    });
                };
            });

            $.when.apply($, imagesToBeUploaded).done(function () {
                Args.success(arguments);
            });
        },
    };
});