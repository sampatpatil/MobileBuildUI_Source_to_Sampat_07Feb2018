define(['cma/lib/validation/rules'], function (APRules) {
    var getRules = function (AP) {
        var getMessage = function (key) {
            return AP.View.Internationalize.translate(key);
        };

        var ruleHook = function (input) {
            return [input, input.parentsUntil('form').data('kendoValidator')];
        },
        externalRules = APRules(AP);


        var _compiledRules, compileRules = function (obj) {
            if (!_compiledRules) {
                var rs = {}, msgs = {};
                _.each(externalRules, function (externalRule, k) {
                    var erule = new externalRule();
                    rs[k] = _.hook(ruleHook, erule.getHandler());
                    msgs[k] = $.proxy(function () { return getMessage(erule.message); }, erule);

                });
                _compiledRules = { rules: rs, messages: msgs };
            }
            return _compiledRules;
        };

        return {
            getAllRules: compileRules,
            buildRules: function (requiredRules) {
                var rls = {}, msgs = {};
                var compiledRules = compileRules();

                _.each(requiredRules, function (k) {
                    compiledRules.messages.hasOwnProperty(k) && (msgs[k] = compiledRules.messages[k]);
                    compiledRules.rules.hasOwnProperty(k) && (rls[k] = compiledRules.rules[k]);
                });
                return { rules: rls, messages: msgs };
            },
            getAllRulesName: function (excludeRule) {
                var rls = [];
                var compiledRules = compileRules();
                compiledRules.hasOwnProperty('rules') && (rls = _.keys(compiledRules.rules));
                return rls;
            }
        };
    };
    return getRules;
});