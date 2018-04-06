define(function () {
    return function (Args) {
        // Design file to display details and download link for selected app.
        return {
            Master: 'root',
            Blocks: [
                {
                    ExBlocksClass: 'DownloadAddedApp custom-scrollable',
                    Blocks: [
                        {
                            // To display back button.
                            Class: 'absolute',
                            Template: {
                                Path: 'apps/cma/content/templates/control/backbutton'
                            }
                        },
                        {
                            ExClass: 'DownloadPage',
                            Name: 'DownloadPage',
                            Widget: {
                                Type: 'APTemplatedWidget',
                                QueryId: 'CMADownloadApp',
                                Config: {
                                    template: {
                                        Path: 'apps/cma/content/sections/addApp/finishAddingApp'
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