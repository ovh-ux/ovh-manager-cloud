class ControllerRequestHelper {
    constructor ($q) {
        this.$q = $q;
    }

    getHashLoader (config) {
        const loader = {
            loading: false,
            data: {},
            hasErrors: false
        };

        return this.getLoader(loader, config);
    }

    getArrayLoader (config) {
        const loader = {
            loading: false,
            data: [],
            hasErrors: false
        };

        return this.getLoader(loader, config);
    }

    getLoader (initialData = {}, config) {
        const loader = initialData;

        if (_.isFunction(config)) {
            config = {
                loaderFunction: config
            };
        }

        loader.load = () => {
            if (_.isArray(initialData.data) || _.keys(initialData.data).length === 0) {
                loader.loading = true;
            }
            return config.loaderFunction()
                .then(response => {
                    loader.data = response.data || response;
                    loader.hasErrors = false;

                    if (config.successHandler) {
                        config.successHandler(response);
                    }

                    return response;
                })
                .catch(response => {
                    loader.hasErrors = true;

                    if (config.errorHandler) {
                        config.errorHandler(response);
                    }

                    return this.$q.reject(response);
                })
                .finally(() => {
                    loader.loading = false;
                });
        };

        return loader;
    }
}

angular.module("managerApp").service("ControllerRequestHelper", ControllerRequestHelper);
