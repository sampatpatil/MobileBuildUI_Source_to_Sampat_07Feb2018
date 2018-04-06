define(['kendo'], function () {

    return new (function () {
        var me = this;
        me.TemplateHTML = {};// html strings
        me.TemplateCache = {};// html strings

        me.registerTemplate = function (templateId, template) {
            if (me.TemplateCache[templateId]) return;
            me.TemplateHTML[templateId] = template;
            me.TemplateCache[templateId] = kendo.template(template, { useWithBlock: false });
        };

        me.compileTemplate = function (template, options) {
            return kendo.template(template, options || { useWithBlock: false });
        };

        me.compile = function (templateId) {
            var template = me.TemplateHTML[templateId];
            template && (me.TemplateCache[templateId] = me.compileTemplate(template, { useWithBlock: false }));
            return me.TemplateCache[templateId];
        };

    })();

});