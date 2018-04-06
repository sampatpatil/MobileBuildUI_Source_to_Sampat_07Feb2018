define(function () {

    var base64ToFile = function (dataurl, filename) {
        var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);

        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        };

        try {
            return new File([u8arr], filename, { type: mime });
        } catch (e) {
            //create a second blob that uses the first blob in its array
            return new Blob([new Blob([u8arr], { type: mime })]);
        };
    },
        trimBase64String = function (str) {
            var arr = str.split('base64,');
            return arr[arr.length - 1];
        },
        uploadImage = function (Args) {
            var fileName = Args.imageName;
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
                        def.resolve($.extend(true, {}, e, { IdName: e.SaveBinaryDataResult + ',' + fileName })); 
                    },
                    error: function (e) {
                        def.reject(e);
                    }
                });

            return def.promise();
        },
        getImage = function (Args, imageType) {
            var AP = Args.AP,
                def = $.Deferred();
            AP.Config.customAjaxRequest({
                QueryMethod: kendo.format('GetBinaryData/{0}', Args.imageData.Id),
                QueryType: 'GET',
                contentType: 'blob'
            }, {
                    success: function (response) {
                        var reader = new FileReader();

                        reader.onload = function (event) {
                            Args.imageData.set('Content', event.target.result);
                            Args.imageData.set('isDefaultImage', false);
                            def.resolve(true);
                        };
                        reader.readAsDataURL(response);
                    },
                    error: function (response) {
                        console.error(response);
                        def.resolve(false);
                    }
                });

            return def.promise();
        },
        getCertificate = function (Args) {
            var me = this,
                AP = Args.AP,
                def = $.Deferred();

            AP.Config.customAjaxRequest({
                QueryMethod: kendo.format('GetBinaryData/{0}', Args.Certificate.get('Id')),
                QueryType: 'GET',
                contentType: 'blob'
            }, {
                    success: function (e) {
                        if (e) {
                            var url = window.URL || window.webkitURL,
                                reader = new FileReader();

                            reader.onload = function (event) {
                                Args.Certificate.set('Content', event.target.result);
                                def.resolve(true);
                            };
                            reader.readAsDataURL(e);
                        }
                        else {
                            Args.Certificate.set('Id', '');
                            def.resolve();
                        };
                    },
                    error: function (e) {
                        def.reject();
                    }
                });

            return def.promise();
        },
        uploadCertificate = function (Args) {
            var me = this,
                AP = Args.AP,
                queryMethodTemplate = 'SaveBinaryData',
                def = $.Deferred();

            if (Args.CertificateVm.Content) {

                if (Args.CertificateVm.Id) {
                    queryMethodTemplate = 'DuplicateLargeData/{0}/{1}';

                    AP.Config.AjaxRequest({
                        QueryMethod: kendo.format(queryMethodTemplate, Args.fileName + '_' + Args.oldAppId, Args.fileName + '_' + Args.appId),
                        QueryType: 'POST',
                        contentType: 'application/octet-stream'
                    }, {
                            success: function (newId) {
                                Args.CertificateVm.set('Id', newId)
                                def.resolve(newId);
                            },
                            error: function (e) {
                                def.reject(e);
                            }
                        });
                }
                else {
                    AP.Config.AjaxRequest({
                        QueryMethod: queryMethodTemplate,
                        QueryType: 'POST',
                        QueryJsonData: {
                            AppId: Args.appId,
                            BinaryDataAsBase64: trimBase64String(Args.CertificateVm.Content),
                            ContentType: Args.CertificateVm.contentType,
                            FileName: Args.fileName
                        },
                    }, {
                            success: function (e) {
                                Args.CertificateVm.set('Id', e.SaveBinaryDataResult);
                                def.resolve(e);
                            },
                            error: function (e) {
                                def.reject(e);
                            }
                        });
                };
            }
            else {
                def.resolve(true);
            };

            return def.promise();
        };

    var addEditApp = {
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

        uploadCertificates: function (Args) {
            var me = this,
                AP = Args.AP,
                certificatesToBeUploaded = [];

            $.each(Args.CertificateVm, function (platform) {
                if (this.isSelected && this.isSelected()) {
                    certificatesToBeUploaded.push(uploadCertificate.call(me, { CertificateVm: this, AP: AP, fileName: platform, appId: Args.appId, oldAppId: Args.oldAppId }));
                };
            });

            $.when.apply($, certificatesToBeUploaded).done(function () {
                Args.success();
            });
        },

        getImages: function (Args) {
            var me = this,
                AP = Args.AP,
                imagesToBeFetched = [];

            $.each(Args.ImagesData, function (platform) {
                if (this.isSelected && this.isSelected()) {
                    $.each(this, function (imageType) {
                        if (platform == 'Android') {
                            $.each(this, function (androidImageType) {
                                if (this.Id) {
                                    imagesToBeFetched.push(getImage.call(me, { imageData: this, AP: AP, data: Args.data }, imageType));
                                };
                            });
                        }
                        else if (this.Id) {
                            imagesToBeFetched.push(getImage.call(me, { imageData: this, AP: AP, data: Args.data }, imageType));
                        };
                    });
                };
            });

            $.when.apply($, imagesToBeFetched).done(function () {
                Args.success();
            });
        },


        getCertificateFiles: function (Args) {
            var me = this,
                AP = Args.AP,
                certificatesToBeFetched = [];

            $.each(Args.CertificateVm, function (platform) {
                if (this.Id) {
                    certificatesToBeFetched.push(getCertificate.call(me, { Certificate: this, AP: AP }));
                };
            });

            $.when.apply($, certificatesToBeFetched).done(function () {
                Args.success();
            });
        },

        createApp: function (Args) {
            var me = this,
                AP = Args.AP;

            AP.Config.AjaxRequest({
                QueryMethod: 'CreateMobileApp',
                QueryType: 'POST',
                QueryJsonData: {
                    "AppAutoNewVersion": "",
                    "AppBaseId": "",
                    "AppCompanyName": Args.data.ApplicationSettings.CompanyName,
                    "AppCompanyWebsite": Args.data.ApplicationSettings.CompanyWebsite,
                    "AppCreatedBy": AP.Config.Data.UserData.Username || '',
                    "AppCreatedDate": "\/Date(" + Date.now() + ")\/",
                    "AppDescription": Args.data.ApplicationSettings.Description,
                    "AppDisplayName": Args.data.ApplicationSettings.Name,
                    "AppDistributionList": '',
                    "AppId": "",
                    "AppInternalName": Args.data.ApplicationSettings.Name,
                    "AppIsAutoDeploy": true,
                    "AppLastModifiedBy": "",
                    "AppLastModifiedDate": "\/Date(" + Date.now() + ")\/",
                    "AppLockedBy": AP.Config.Data.UserData.Username,
                    "AppLockedDate": "\/Date(" + Date.now() + ")\/",
                    "AppLogo": "",
                    "AppOwner": AP.Config.Data.UserData.Username,
                    "AppStatus": Args.statusCode,
                    "AppVersion": Args.data.ApplicationSettings.AppVersion
                }
            }, {
                    success: function (response) {
                        Args.success && Args.success(response);
                    },
                    error: function (response) {
                        if (Args.error) {
                            Args.error(response);
                            return true;
                        };
                    }
                });
        },

        updateApp: function (Args) {
            var me = this,
                AP = Args.AP,
                dataStore = AP.Config.loadQuery('CMADataStore');

            AP.Config.AjaxRequest({
                QueryMethod: Args.API || 'UpdateMobileAppStatus',
                QueryType: 'POST',
                QueryJsonData: {
                    "AppAutoNewVersion": dataStore.get('ActiveAppMetaData.AppAutoNewVersion') || '',
                    "AppBaseId": dataStore.get('ActiveAppMetaData.AppBaseId') || '',
                    "AppCompanyName": Args.data.ApplicationSettings.CompanyName,
                    "AppCompanyWebsite": Args.data.ApplicationSettings.CompanyWebsite,
                    "AppCreatedBy": AP.Config.Data.UserData.Username || '',
                    "AppCreatedDate": dataStore.get('ActiveAppMetaData.AppCreatedDate') || "\/Date(" + Date.now() + ")\/",
                    "AppDescription": Args.data.ApplicationSettings.Description,
                    "AppDisplayName": Args.data.ApplicationSettings.Name,
                    "AppDistributionList": Args.data.ApplicationSettings.distributionList,
                    "AppId": dataStore.get('ActiveAppMetaData.AppId'),
                    "AppInternalName": Args.data.ApplicationSettings.Name,
                    "AppIsAutoDeploy": true,
                    "AppLastModifiedBy": AP.Config.Data.UserData.Username || '',
                    "AppLastModifiedDate": "\/Date(" + Date.now() + ")\/",
                    "AppLockedBy": AP.Config.Data.UserData.Username || '',
                    "AppLockedDate": "\/Date(" + Date.now() + ")\/",
                    "AppLogo": Args.data.ApplicationSettings.appLogoId,
                    "AppOwner": AP.Config.Data.UserData.Username,
                    "AppStatus": Args.statusCode,
                    "AppVersion": Args.data.ApplicationSettings.AppVersion || '1.0'
                }
            }, {
                    success: function (response) {
                        Args.success && Args.success(response);
                    },
                    error: function (response) {
                        if (Args.error) {
                            Args.error(response);
                            return true;
                        };
                    }
                });
        },

        saveXmlFile: function (Args) {
            var me = this,
                AP = Args.AP;

            AP.Config.AjaxRequest({
                QueryMethod: 'SaveTextData',
                QueryType: 'POST',
                QueryJsonData: {
                    "BinaryData": [],
                    "ContentType": "xml",
                    "CreatedDate": "\/Date(" + Date.now() + ")\/",
                    "ELEMENTID": "",
                    "SecondaryReference": "AppSettings_" + Args.appId,
                    "TextData": Args.xmlString
                }
            }, {
                    success: function (response) {
                        Args.success(response);
                    },
                    error: function (response) {
                        Args.error && Args.error(response);
                    }
                });
        },

        getXmlFile: function (Args) {
            var me = this,
                AP = Args.AP;

            AP.Config.AjaxRequest({
                QueryMethod: kendo.format('GetTextData/{0}', ("AppSettings_" + Args.appId)),
                QueryType: 'GET',
            }, {
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
            }, {
                    success: function (response) {
                        Args.success(response);
                    },
                    error: function (response) {
                        Args.error && Args.error(response);
                    }
                });
        }
    };

    return addEditApp;
});