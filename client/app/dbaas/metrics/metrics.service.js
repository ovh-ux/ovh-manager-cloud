angular.module("managerApp")
    .service("metricsService", class {

        constructor (Metrics, $q) {
            this.mainResource = Metrics;
            this.q = $q;
        }

        setService (serviceName) {
            this.serviceName = serviceName;
        }

        getServiceName () {
            return this.serviceName;
        }

        getService () {
            return this.mainResource.Service().Lexi()
                .get({
                    serviceName: this.serviceName
                }).$promise;
        }

        setServiceDescription (description) {
            return this.mainResource.Service().Lexi()
                .edit({
                    serviceName: this.serviceName
                }, {
                    description
                }).$promise;
        }

        getConsumption () {
            return this.mainResource.Service().Consumption().Lexi()
                .get({
                    serviceName: this.serviceName
                }).$promise;
        }

        getTokens () {
            return this.mainResource.Service().Token().Lexi()
                .query({
                    serviceName: this.serviceName
                })
                .$promise
                .then((tokenList) => {

                    return this.q.all(tokenList.map((tokenID) => {
                        return this.mainResource.Service().Token().Lexi()
                            .get({
                                serviceName: this.serviceName,
                                tokenID
                            });
                    }));
                });
        }

        addToken (token) {
            this.mainResource.Service().Token().Lexi().resetAllCache();
            return this.mainResource.Service().Token().Lexi()
                .save(token)
                .$promise;
        }

        updateToken (tokenID, description) {
            this.mainResource.Service().Token().Lexi().resetAllCache();
            return this.mainResource.Service().Token().Lexi()
                .edit({
                    serviceName: this.serviceName,
                    tokenID
                }, {
                    description
                }).$promise;
        }

        delToken (tokenID) {
            this.mainResource.Service().Token().Lexi().resetAllCache();
            return this.mainResource.Service().Token().Lexi()
                .delete({
                    serviceName: this.serviceName,
                    tokenID
                })
                .$promise;
        }
    });
