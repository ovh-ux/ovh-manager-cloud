(() => {
    class MetricsTokenCtrl {
        constructor ($stateParams, $translate, ControllerHelper, MetricService) {
            this.$stateParams = $stateParams;
            this.serviceName = $stateParams.serviceName;
            this.$translate = $translate;
            this.ControllerHelper = ControllerHelper;
            this.MetricService = MetricService;

            this.tokens = [];
            this.loading;
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

        displayRemainingLabels (number) {
            return '+' + number;
        }

        showPreview (tokenID) {
            this.ControllerHelper.modal.showModal({
                modalConfig: {
                    templateUrl: "app/dbaas/metrics/token/preview/metrics-token-preview.html",
                    controller: "MetricsTokenPreviewCtrl",
                    controllerAs: "$ctrl",
                    resolve: {
                        serviceName: () => this.serviceName,
                        tokenID: () => tokenID
                    }
                }
            });
        }

        edit (tokenID, desc) {
            this.ControllerHelper.modal.showModal({
                modalConfig: {
                    templateUrl: "app/dbaas/metrics/token/edit/metrics-token-edit.html",
                    controller: "MetricsTokenEditCtrl",
                    controllerAs: "$ctrl",
                    resolve: {
                        metricsType: () => "name",
                        metricsValue: () => desc,
                        serviceName: () => this.serviceName,
                        tokenID: () => tokenID
                    }
                },
                successHandler: result => {
                    this.getTokens(this.serviceName);
                }
            });

        }

        delete (tokenID) {
            this.ControllerHelper.modal.showModal({
                modalConfig: {
                    templateUrl: "app/dbaas/metrics/token/delete/metrics-token-delete.html",
                    controller: "MetricsTokenDeleteCtrl",
                    controllerAs: "$ctrl",
                    resolve: {
                        serviceName: () => this.serviceName,
                        tokenID: () => tokenID
                    }
                },
                successHandler: result => {
                    this.getTokens(this.serviceName);
                }
            });
        }

    }

    angular.module("managerApp").controller("MetricsTokenCtrl", MetricsTokenCtrl);
})();
