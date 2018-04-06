
define(

    [
        'lib/modules/i18next'
    ],

    function (i18n) {

        'use strict';

        var AP,
            Me;

        var AgilePointInternationalization = function (AgilePoint) {

            AP = AgilePoint;
            Me = this;

            this.Ready = false;

            Me.i18n = i18n;

            Me.i18n.init({
                resGetPath: AP.Config.Data.RootPath + 'locales/__lng__/__ns__.json',
                fallbackLng: 'default',
                ns: {
                    namespaces: ['main', 'form', 'api', 'widgets'],
                    defaultNs: 'main'
                },
                selectorAttr: 'data-i18n',
                //dataType: 'text',
                useLocalStorage: false,
                localStorageExpirationTime: (AP.Config.Data.Session.staySignedInFor || 7) * 24 * 60 * 60 * 1000,
                debug: false,
                customLoad: function (lng, namespace, options, loadComplete) {
                    var url = i18n.functions.applyReplacement(options.resGetPath, { lng: lng, ns: namespace });

                    require(['text!' + url], function (json) {
                        loadComplete(null, JSON.parse(json));
                    }, function (err) {
                        loadComplete(err);
                    });

                }
            },
            function () { Me.Ready = true; });
        };

        AgilePointInternationalization.prototype.getCulture = function (Culture) {

            return Me.i18n.lng();
        };

        AgilePointInternationalization.prototype._loadKendoCulture = function (Culture) {
            var deferred = $.Deferred();

            require(['lib/modules/cultures/kendo.culture.' + Culture], function (d) {
                kendo.culture(Culture);
                deferred.resolve();
            }, function () {
                deferred.resolve();
            });

            return deferred.promise();
        };

        AgilePointInternationalization.prototype._loadCulture = function (Culture) {
            var deferred = $.Deferred();
            Me.i18n.setLng(Culture, function () {
                AP.Controller.route('state/Data/set/culture/' + Culture);
                AP.Controller.Events.Model.onChangeCulture.dispatch(Culture);
                deferred.resolve();
            });
            return deferred.promise();
        };

        AgilePointInternationalization.prototype.setCulture = function (Culture) {

            return $.when(this._loadKendoCulture(Culture), this._loadCulture(Culture));

        };

        AgilePointInternationalization.prototype.getMessageTree = function (key) {
            return Me.translateWithOptions(key, { returnObjectTrees: true });
        };

        AgilePointInternationalization.prototype.translateWithOptions = function (key, options) {
            return Me.i18n.t(key, options);
        };

        AgilePointInternationalization.prototype.translate = function (Translate) {

            var Key,
                Values;

            if (typeof Translate == 'string') {

                Key = Translate;
                Values = null;
                if (Key.length == 0) return '';
            } else {

                Key = Translate.Key;
                Values = Translate.Values;
            };
            return Me.i18n.t(Key, Values);
        };

        return AgilePointInternationalization;
    }
);



