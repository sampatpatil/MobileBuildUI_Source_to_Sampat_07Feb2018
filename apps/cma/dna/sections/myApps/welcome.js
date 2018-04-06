define(function () {
    return function (Args) {
        // App list page design.
        return {
            //Master: 'root',
            Blocks: [
                {
                    Name: 'Welcome',
                    ExClass: '',
                    Widget: {
                        Type: 'APTemplatedWidget',
                        QueryId: '',
                        Config: {
                            template: {
                                Path: 'apps/cma/content/sections/welcome'
                            },
                        }
                    }
                }

            ]
        }
    }

});