/// <reference path="engine/js/lib/modules/require.intellisense.js" />
/// <reference path="engine/js/lib/modules/jquery.js" />
/// <reference path="engine/js/lib/modules/underscore.js" />
/// <reference path="engine/js/lib/modules/kendo.all-vsdoc.js" />
/// <reference path="engine/js/lib/modules/async.js" />

'use strict';
/* Debug Global Namespace */
var APPS = [];
/* Module system */

requirejs.config({
    baseUrl: 'engine/js',
    waitSeconds: 120,
    jsx: {
        fileExtension: '.jsx'
    },
    paths: {
        main: '../../main',
        'app.cma': '../../app.cma',
        apps: '../../apps',
        cma: '../../apps/cma',
        dna: '../../apps/cma/dna',
        templateStore: 'ap/modules/view/templateStore',
        templates:'../../engine/templates',
        content: '../../apps/cma/content',
        jquery: 'lib/modules/jquery',
        xmlParser: 'lib/modules/xmlParser',
        xpath: 'lib/modules/jquery.xpath.min',
        xmltree: 'lib/modules/xmltree',
        //'jquery.plugins': 'lib/jquery.plugins',
        kendo: 'lib/modules/kendo',
        kendoEx: 'lib/modules/kendoEx',
        react: "lib/modules/react/react-with-addons",
        JSXTransformer: "lib/modules/react/JSXTransformer-0.10.0",
        text: "lib/modules/require/text",
        jsx: "lib/modules/react/jsx",
        async: "lib/modules/async",
        parallel: "lib/modules/parallel",
        moment: "lib/modules/momentjs",
        underscore: 'lib/modules/underscore',
        cookies: 'lib/modules/cookies',
        cm: 'lib/modules/codemirror',
        'slider': 'lib/modules/nivo.slider'
    },
    shim: {
        'app.cma': {
            deps: ['jquery', 'kendo', 'kendoEx', 'xmlParser']
        },
        'kendo': {
            deps: ['jquery']
        },
        'kendoEx': {
            deps: ['kendo']
        },
        'xpath': {
            deps: ['jquery']
        }
        //'slider': {
        //    deps: ['jquery'],
        //    exports: '$'
        //}
    }
});

window.preloader = {};

require(['jquery', 'async'], function ($) {

    window.preloader = new (function () {
        var idx = -1,
            queue = 'seq',
            inout = 750,
            stay = 3000,
            $elts = $('.APMetroContentBlock');
        var scheduleAnim = function ($elt, callback) {
            $elt.animate({
                opacity: 1
            }, {
                queue: queue,
                duration: inout
            })
                .delay(stay, queue)
                .animate({
                    opacity: 0
                }, {
                    queue: queue,
                    duration: inout,
                    start: callback
                });

            $elt.dequeue(queue);
        };
        var continueAnim = function () {
            idx = idx == $elts.length - 1 ? 0 : ++idx;
            scheduleAnim($elts.eq(idx), continueAnim);
        };

        continueAnim();
        this.stop = function () {
            $elts.stop(true);
        };
    })();


});
require(['jquery', 'kendo', 'kendoEx', 'xmlParser', 'app.cma'], function ($, kendo, kx, xmlParser, CMA) {

    window.preloader.stop();
    delete window.preloader;

    $(function () {
        CMA.create(function (AP) { //Create application asynchronously
            APPS.push(AP); //Save the app object to the store
        });
    });
});
