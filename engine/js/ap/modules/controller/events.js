
define(

    [
        'lib/modules/signals'
    ],

    function (Signal) {

        'use strict';

        var AP;

        var AgilePointControllerEvents = {

            App: {
                onLogOut: new Signal
            },

            Model: {
                onNewData: new Signal, 					// New chunk loaded
                onDataQueueComplete: new Signal,		// Load chunks queue complete
                onChangeCulture: new Signal, 			// Language / Culture changed       
                onInterfaceStateChange: new Signal
            },

            View: {
                onBreadCrumbsChanged: new Signal, 		// Changed path
                onNewDataRendered: new Signal 			// Loaded and rendered chunk
            },

            Window: {
                onResize: new Signal // Browser window resize
            }
        };

        return AgilePointControllerEvents;
    }
);
