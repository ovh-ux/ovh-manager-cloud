(() => {
    class MetricsTokenCtrl {
        constructor ($scope, $stateParams, $translate, ControllerHelper, MetricService, ovhDocUrl) {
            this.scope = $scope;
            this.$stateParams = $stateParams;
            this.serviceName = $stateParams.serviceName;
            this.$translate = $translate;
            this.ControllerHelper = ControllerHelper;
            this.MetricService = MetricService;
            this.ovhDocUrl = ovhDocUrl;

            this.tokens = [];
            this.loading = false;
        }

        $onInit () {
            this.getTokens(this.serviceName);
        }

        getTokens (serviceName) {
            this.loading = true;
            this.MetricService.getTokens(serviceName)
                .then(data => {
                    this.tokens = data.filter(token => token.isRevoked === false);
                    this.loading = false;
                });
        }

        getGuides () {
            return this.ovhDocUrl.getDocUrl("cloud/metrics");
        }

        displayRemainingLabels (number) {
            return `+${number}`;
        }

        showPreview (tokenID) {
            this.ControllerHelper.modal.showModal({
                modalConfig: {
                    templateUrl: "app/dbaas/dbaas-metrics/token/preview/metrics-token-preview.html",
                    controller: "MetricsTokenPreviewCtrl",
                    controllerAs: "$ctrl",
                    resolve: {
                        serviceName: () => this.serviceName,
                        tokenID: () => tokenID
                    }
                }
            });
        }

        edit (tokenID, desc) {
            this.ControllerHelper.modal.showModal({
                modalConfig: {
                    templateUrl: "app/dbaas/dbaas-metrics/token/edit/metrics-token-edit.html",
                    controller: "MetricsTokenEditCtrl",
                    controllerAs: "$ctrl",
                    resolve: {
                        metricsType: () => "name",
                        metricsValue: () => desc,
                        serviceName: () => this.serviceName,
                        tokenID: () => tokenID
                    }
                },
                successHandler: () => this.getTokens(this.serviceName)
            });

        }

        delete (tokenID) {
            this.ControllerHelper.modal.showModal({
                modalConfig: {
                    templateUrl: "app/dbaas/dbaas-metrics/token/delete/metrics-token-delete.html",
                    controller: "MetricsTokenDeleteCtrl",
                    controllerAs: "$ctrl",
                    resolve: {
                        serviceName: () => this.serviceName,
                        tokenID: () => tokenID
                    }
                },
                successHandler: () => this.getTokens(this.serviceName)
            });
        }

    }

    angular.module("managerApp").controller("MetricsTokenCtrl", MetricsTokenCtrl);
})();
