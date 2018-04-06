define(['ap/modules/utils', 'xmlParser', 'text!../../locales.xml'], function (apUtils, xmlParser, localesXml) {

    return apUtils.extend({
        verifyImageDimensions: function (AP, imageSrc, config) {
            var isValid = true;
            config = config || {};
            if (!AP.Config.Data.isImageSizeValidationRequired) return isValid;
            if (imageSrc && config.width && config.height) {
                var img = $(this.sender.element).closest('.ImageUploader').find('.PreviewImage')[0];
                if (img.naturalWidth !== config.width || img.naturalHeight !== config.height) {
                    isValid = false;
                };
            };

            return isValid;
        },
        downloadBlob: function (blob, fileName) {
            fileName = fileName || 'unknown';
            if (window.navigator.msSaveBlob) {
                // For IE.
                window.navigator.msSaveBlob(blob, fileName);
            }
            else if (/constructor/i.test(window.HTMLElement)) {
                // For safari.
                var url = 'data:text/plain;charset=utf-8,' + window.encodeURIComponent(fileContent),
                    popup = window.open(url, '_blank');
                if (!popup) window.location.href = url;
            }
            else {
                // For other browsers.
                var elem = document.createElement('a');
                elem.href = window.URL.createObjectURL(blob);
                elem.download = fileName;
                document.body.appendChild(elem);
                elem.click();
                elem.remove();
            };
        },
        parseCommanErrorMessage: function (message) {
            try {
                var startTag = 'The exception message is \'',
                            endTag = '\'. See server logs for more details',
                            startIndex = message.indexOf(startTag),
                            endIndex = message.indexOf(endTag);

                return message.substring(startIndex + startTag.length, endIndex);
            } catch (e) {
                console.error(e);
                return 'Unable to parse error message. Please check console for more details.';
            }
        },
        path: {
            join: function (left, right) {
                return left + ((left.charAt(left.length - 1) != '/') ? '/' : '') + right;

            }
        },
        fetchFullLocales: function(receivedLocale){
                var formatter = function (v) {
                    return $.trim(v);
                },
                    parser = new xmlParser(localesXml, {
                        root: 'Locales',
                        itemSelector: 'Locale',
                        nodes: {
                            Name: { selector: 'Name', format: formatter },
                            Value: { selector: 'Value', format: formatter }
                        }
                    }),
                    data = parser.parse();
                    for(i in data){
                        if(data[i].Value === receivedLocale) return data[i].Name;
                    }
                    return 'Default Language';
        },

        fetchBuildTypes: function(xmldata){
            var $xml = $($.parseXML(xmldata));
            var buildTypes = {};
            buildTypes.iOS = $xml.find('AppData IOSAppSettings MobileBuildType').text() || 'MDM';
            buildTypes.Windows = $xml.find('AppData WindowsAppSettings MobileBuildType').text() || 'MDM';
            buildTypes.Android = $xml.find('AppData AndroidAppSettings MobileBuildType').text() || 'MDM';
            return buildTypes;
        }

    });

});

//polyfill for includes method of String object prototype -- Phani

if (!String.prototype.includes) {
    String.prototype.includes = function(search, start) {
      'use strict';
      if (typeof start !== 'number') {
        start = 0;
      }
      
      if (start + search.length > this.length) {
        return false;
      } else {
        return this.indexOf(search, start) !== -1;
      }
    };
  }