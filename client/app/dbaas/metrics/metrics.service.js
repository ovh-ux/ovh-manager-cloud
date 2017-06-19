    class MetricService{

        constructor ($q, $translate, CloudMessage, Metrics) {
            this.$q = $q;
            this.$translate = $translate;
            this.CloudMessage = CloudMessage;
            this.metrics = Metrics.Service();
        }

        getService (serviceName) {
            return this.metrics.Lexi()
                .get({
                    serviceName: serviceName
                }).$promise
                    .then(response => this.acceptResponse(response))
                    .catch(response => this.rejectResponse(response.data, this.$translate.instant("metrics_err_service")) );
        }

        getServiceInfos (serviceName) {
            return this.metrics.ServiceInfos().Lexi()
                .get({
                    serviceName: serviceName
                }).$promise
                    .then(response => this.acceptResponse(response))
                    .catch(response => this.rejectResponse(response.data, this.$translate.instant("metrics_err_service")) );
        }

        setServiceDescription (serviceName, description) {
            return this.metrics.Lexi()
                .edit({
                    serviceName: serviceName
                }, {
                    description
                }).$promise
                    .then(response => this.acceptResponse(response))
                    .catch(response => this.rejectResponse(response.data, this.$translate.instant("metrics_setting_updated")) );

        }

        getConsumption (serviceName) {
            return this.metrics.Consumption().Lexi()
                .get({
                    serviceName: serviceName
                }).$promise
                    .then(response => this.acceptResponse(response))
                    .catch(response => this.rejectResponse(response.data, this.$translate.instant("metrics_err_conso")) );
        }

        getTokens (serviceName) {
            this.metrics.Token().Lexi().resetAllCache();
            return this.metrics.Token().Lexi()
                .query({
                    serviceName: serviceName,
                })
                .$promise
                .then((tokenList) => {
                    return this.$q.all(tokenList.map((tokenID) => {
                        return this.metrics.Token().Lexi()
                            .get({
                                serviceName: serviceName,
                                tokenID
                            }).$promise;
                    }));
                });
        }

        getToken(serviceName, tokenID) {
            return this.metrics.Token().Lexi()
                .get({
                    serviceName: serviceName,
                    tokenID
                }).$promise;
        }

        addToken (token) {
            this.metrics.Token().Lexi().resetAllCache();
            return this.metrics.Token().Lexi()
                .save(token)
                .$promise
                    .then(response => this.acceptResponse(response, this.$translate.instant("metrics_token_created")) )
                    .catch(response => this.rejectResponse(response.data, this.$translate.instant("metrics_token_err_create")) );
        }

        updateToken (serviceName, tokenID, description) {
            this.metrics.Token().Lexi().resetAllCache();
            return this.metrics.Token().Lexi()
                .edit({
                    serviceName: serviceName,
                    tokenID,
                    description
                }).$promise
                    .then(response => this.acceptResponse(response, this.$translate.instant("metrics_token_updated")) )
                    .catch(response => this.rejectResponse(response.data, this.$translate.instant("metrics_token_err_create")) );
        }

        deleteToken (serviceName, tokenID) {
            this.metrics.Token().Lexi().resetAllCache();
            return this.metrics.Token().Lexi()
                .delete({
                    serviceName: serviceName,
                    tokenID
                })
                .$promise
                    .then(response => this.acceptResponse(response, this.$translate.instant("metrics_token_revoked")) )
                    .catch(response => this.rejectResponse(response.data, this.$translate.instant("metrics_err_delete_token")) );
        }

        acceptResponse (data, message) {
            return this.$q.resolve({
                status: "OK",
                data,
                message: this.CloudMessage.success(message)
            });
        }

        rejectResponse (data, message) {
            return this.$q.reject({
                status: "ERROR",
                data,
                message : this.CloudMessage.error(message)
            });
        }
    }

    angular.module("managerApp").service("MetricService", MetricService);
