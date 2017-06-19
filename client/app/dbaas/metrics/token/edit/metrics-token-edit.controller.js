(() => {
    class MetricsTokenEditCtrl {
        constructor ($uibModalInstance, metricsValue, metricsType, serviceName, tokenID, MetricService) {
            this.$uibModalInstance = $uibModalInstance;
            this.serviceName = serviceName;
            this.tokenID = tokenID;
            this.MetricService = MetricService;

            this.type = metricsType;
            this.value = metricsValue;
        }


        confirm () {
            this.loading = true;
            if (this.type == "name") {
                return this.MetricService.updateToken (this.serviceName, this.tokenID, this.value)
                    .then(response => this.$uibModalInstance.close(response))
                    .catch(err => this.$uibModalInstance.dismiss(err))
                    .finally(() => this.loading = false);
            }
            
        }

        cancel () {
            this.$uibModalInstance.dismiss();
        }

    }

    angular.module("managerApp").controller("MetricsTokenEditCtrl", MetricsTokenEditCtrl);
})();
