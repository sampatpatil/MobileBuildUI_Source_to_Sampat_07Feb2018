/// <reference path="engine/js/lib/modules/require.intellisense.js" />

'use strict';
define(['lib/lib', 'cma/utils', 'ap/ap', 'xmlParser', 'cma/config'], function (Lib, Utils,
                            AgilePoint, 						// Agilepoint Engine
                            xmlParser,
                            CustomizeMobileAppsDefaultConfig			// Enterprise Manager Config & Data
                                  ) {



    var create = function (done) {

        require(['text!../../cma.settings.xml'], function (ConfigXml) {
            var formatter = function (v) {
                return $.trim(v);
            },
            parser = new xmlParser($(ConfigXml), {
                itemSelector: 'Property',
                attributes: {
                    Type: { defaultValue: 'String', selector: 'Type' }
                },
                nodes: {
                    Name: { selector: 'Name', format: formatter },
                    Value: { selector: 'Value', format: formatter }
                }
            });

            var overrides = parser.parse();
            var model = kendo.observable(CustomizeMobileAppsDefaultConfig.fn.Data);
            _.each(overrides, function (ovr) {
                var val = ovr.Value;
                switch (ovr.Type) {
                    case 'Number':
                        val = val.indexOf('.') > -1 ? parseFloat(val) : parseInt(val);
                        break;
                    case 'Boolean':
                        val = val === 'true' ? true : false;
                        break;
                }
                model.set(ovr.Name, val);
            });

            require([], function () {
                (window.setImmediate || window.setTimeout)(function () {
                    $('.main-preloader:first').remove();
                });
                var CustomizeMobileAppsConfig = new CustomizeMobileAppsDefaultConfig(model.toJSON()),
                    AgilePointCustomizeMobileApps = new AgilePoint(CustomizeMobileAppsConfig, Utils);
                done && done(AgilePointCustomizeMobileApps);
            });

        });

    };
    return { create: create };
});

