
define(['templateStore'],
    function (templateStore) {

        'use strict';

        var AP;

        var fetchTemplate = function (config) {
            config = $.extend(
                {  // false on debug
                    cache: false,
                    async: false, dataType: 'text'
                }, config);

            $.ajax(config);
        };



        var AgilePointTemplateServer = function (AgilePoint) {

            AP = AgilePoint;
        };

        AgilePointTemplateServer.prototype.TemplateHTML = {}; // html strings

        AgilePointTemplateServer.prototype.TemplateCache = {}; // kendo template objects

        AgilePointTemplateServer.prototype.addHelperMethods = function (Data) {
            Data.AP = AP;
            Data.T = function (key) { return AP.View.Internationalize.translate(key || ''); };
            Data.renderTemplate = function () {
                return AP.View.Templates.renderTemplate.apply(AP.View.Templates, arguments);
            };
            return Data;
        };

        AgilePointTemplateServer.prototype.loadTemplate = function (TemplateId) {
            var TemplatesAppPath = AP.Config.Data.templatesPath,
            TemplatesExtension = '.html', BrowserCache = false;
            var templateId = TemplateId, relativePath = templateId;

            if (typeof templateId != 'string') {
                TemplatesAppPath = AP.Config.Data.hostPath;
                relativePath = TemplateId.Path;
                TemplatesExtension = TemplateId.Extension || TemplatesExtension;
                templateId = TemplatesAppPath + relativePath;
            }
            //console.log(templateId);
            if (!templateStore.TemplateCache[templateId]) {

                if (!templateStore.TemplateHTML[templateId]) {

                    // false on debug
                    //templateStore.TemplateHTML[TemplateId] = infuser.getSync(TemplateURL);
                    var TemplateURL = TemplatesAppPath + relativePath + TemplatesExtension;
                    fetchTemplate({
                        url: TemplateURL, context: this, cache: BrowserCache,
                        success: function (data) {
                            templateStore.TemplateHTML[templateId] = data;
                            templateStore.registerTemplate(templateId, data);
                        }
                    });
                };
                //console.log(templateId);
                templateStore.compileTemplate(templateId);
            }

            return templateId;
        };

        AgilePointTemplateServer.prototype.getTemplate = function (TemplateId) {

            var templateId = this.loadTemplate(TemplateId);
            return templateStore.TemplateCache[templateId];
        };

        AgilePointTemplateServer.prototype.getCompiledTemplate = function (TemplateId) {

            return this.getTemplate(TemplateId);
        };

        AgilePointTemplateServer.prototype.renderTemplate = function (TemplateId, Data) {

            var Data = Data || {},
                CompiledTemplate = this.getCompiledTemplate(TemplateId);

            Data = this.addHelperMethods(Data);
            return CompiledTemplate(Data);
        };


        /*******************************************************************/
        // Code to load templates asyncronously

        AgilePointTemplateServer.prototype.loadTemplateAsync = function (TemplateId, callbacks) {
            var TemplatesAppPath = AP.Config.Data.templatesPath,
            TemplatesExtension = '.html', BrowserCache = false;
            var templateId = TemplateId, relativePath = templateId;

            if (typeof templateId != 'string') {
                TemplatesAppPath = AP.Config.Data.hostPath;
                relativePath = TemplateId.Path;
                TemplatesExtension = TemplateId.Extension || TemplatesExtension;
                templateId = TemplatesAppPath + relativePath;
            }

            if (!templateStore.TemplateCache[templateId]) {

                if (!templateStore.TemplateHTML[templateId]) {

                    // false on debug
                    //templateStore.TemplateHTML[TemplateId] = infuser.getSync(TemplateURL);
                    var TemplateURL = TemplatesAppPath + relativePath + TemplatesExtension;
                    fetchTemplate({
                        async: true, url: TemplateURL, context: this, cache: BrowserCache,
                        success: function (data) {
                            templateStore.TemplateHTML[templateId] = data;
                            templateStore.TemplateCache[templateId] = kendo.template(
                                                templateStore.TemplateHTML[templateId],
                                                { useWithBlock: false }
                                              );
                            callbacks && callbacks.success && callbacks.success.apply(this, [templateStore.TemplateCache[templateId]]);
                        },
                        error: function () {
                            callbacks && callbacks.error && callbacks.error.apply(this, arguments);
                        }
                    });
                } else {
                    templateStore.TemplateCache[templateId] = kendo.template(
                                                templateStore.TemplateHTML[templateId],
                                                { useWithBlock: false }
                                              );
                    callbacks && callbacks.success && callbacks.success.apply(this, [templateStore.TemplateCache[templateId]]);
                }


            } else callbacks && callbacks.success && callbacks.success.apply(this, [templateStore.TemplateCache[templateId]]);

            return templateId;
        };


        AgilePointTemplateServer.prototype.renderTemplateAsync = function (TemplateId, Data, callbacks) {

            var Data = Data || {}, me = this;
            callbacks && this.loadTemplateAsync(TemplateId, {
                success: function (CompiledTemplate) {
                    Data = me.addHelperMethods(Data);
                    callbacks && callbacks.success && callbacks.success(CompiledTemplate(Data));
                }, error: callbacks.error
            });


        };

        return AgilePointTemplateServer;
    }
);

