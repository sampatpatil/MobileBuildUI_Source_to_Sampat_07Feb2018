define(function () {
    return function (Args) {
        return {
            Master: 'root',
            Blocks: [
                {
                    Blocks: [
                         {
                             Name: 'DirectDownload',
                             ExClass: 'DirectDownload',
                             Widget: {
                                 Type: 'APTemplatedWidget',
                                 Config: {
                                     template: {
                                         Path: 'apps/cma/content/sections/directDownload'
                                     },
                                 }
                             }
                         }
                    ]
                }
            ]
        }
    }

});