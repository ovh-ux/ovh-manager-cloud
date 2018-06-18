(() => {
    class MetricsTokenEditCtrl {
        constructor ($uibModalInstance, metricsValue, metricsType, serviceName, tokenID, MetricService, ControllerHelper) {
            this.$uibModalInstance = $uibModalInstance;
            this.serviceName = serviceName;
            this.tokenID = tokenID;
            this.MetricService = MetricService;
            this.ControllerHelper = ControllerHelper;
            this.type = metricsType;
            this.value = metricsValue;
        }

        confirm () {
            if (this.type === "name") {
                this.deleteToken = this.ControllerHelper.request.getHashLoader({
                    loaderFunction: () => this.MetricService.updateToken(this.serviceName, this.tokenID, this.value)
                        .then(response => this.$uibModalInstance.close(response))
                        .catch(err => this.$uibModalInstance.dismiss(err))
                });
                this.deleteToken.load();
            }
        }

        cancel () {
            this.$uibModalInstance.dismiss();
        }
    }

    angular.module("managerApp").controller("MetricsTokenEditCtrl", MetricsTokenEditCtrl);
})();
