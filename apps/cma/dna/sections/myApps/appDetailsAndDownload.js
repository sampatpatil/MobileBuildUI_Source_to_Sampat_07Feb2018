define(function () {
    return function (Args) {
        // Design file to display details and download link for selected app.
        return {
            Master: 'root',
            Blocks: [
                {
                    ExBlocksClass: 'ViewAppDetailsPage custom-scrollable',
                    Blocks: [
                        //{
                        //    // To display back button.
                        //    Class: 'absolute',
                        //    Template: {
                        //        Path: 'apps/cma/content/templates/control/backbutton'
                        //    }
                        //},
                        {
                            Name: 'ViewAppDetails',
                            ExClass: 'ViewAppDetails',
                            Widget: {
                                Type: 'APTemplatedWidget',
                                QueryId: 'CMAAddOrEditApp',
                                Config: {
                                    template: {
                                        Path: 'apps/cma/content/sections/myApps/appDetailsAndDownload'
                                    },
                                }
                            }
                        },
                        {
                            Name: 'BuildHistoryWidget',
                            ExClass: 'BuildHistoryWidget',
                            Widget: {
                                Type: 'APTemplatedWidget',
                                QueryId: 'CMAGetBuildHistory',
                                Config: {
                                    template: {
                                        Path: 'apps/cma/content/sections/myApps/buildHistory'
                                    },
                                    resetQuery: true
                                }
                            },
                            //Blocks:[
                                /*{
                                    Name: 'BuildHistorySelectorForm',
                                    ExClass: 'BuildHistorySelectorForm',
                                    Widget: {
                                        Type: 'APForm',
                                        QueryId: 'CMAGetBuildHistory',
                                        Config: {
                                            FormTemplate: {
                                                Path: 'apps/cma/content/sections/myApps/buildHistorySelector'
                                            },
                                            resetQuery: true
                                        }
                                    }
                                },*/
                                /*{
                                    Name: 'BuildHistory',
                                    ExClass: 'BuildHistory',
                                    Widget: {
                                        Type: 'APTemplatedWidget',
                                        QueryId: 'CMAGetBuildHistory',
                                        Config: {
                                            template: {
                                                Path: 'apps/cma/content/sections/myApps/buildHistory'
                                            },
                                            resetQuery: true
                                        }
                                    }
                                }*/
                            //]
                        },
                        /*{
                            Name: 'BuildHistory',
                            ExClass: 'BuildHistory',
                            Widget: {
                                Type: 'APListView',
                                QueryId: 'CMAGetBuildHistory',
                                Config: {
                                    template: {
                                        Path: 'apps/cma/content/sections/myApps/buildHistory'
                                    },
                                    resetQuery: true
                                }
                            }
                        }*/
                    ]
                }
            ]
        }
    }
});