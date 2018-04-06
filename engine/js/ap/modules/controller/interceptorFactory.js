define([], function () {
    return {
        getFactory: function (AP) {
            var interceptorFactory = function () {
                var store = new Object();
                this.register = function (interceptor) {
                    store[interceptor.path] = interceptor;
                };
                this.remove = function (path) {
                    store.hasOwnProperty(path) && (delete store[path]);
                };
                this.get = function (path) {
                    return store[path];
                };
                this.notifyLoggedIn = function () {
                    _.each(store, function (v,k) {
                        v.onLoggedIn();
                    });
                };
            };
            return new interceptorFactory();
        }
    }
});