(() => {
    class MetricsDashboardEditCtrl {
        constructor ($uibModalInstance, metricsValue, metricsType, serviceName, MetricService) {
            this.$uibModalInstance = $uibModalInstance;
            this.serviceName = serviceName;
            this.MetricService = MetricService;

            this.type = metricsType;
            this.value = metricsValue;
        }


        confirm () {
            this.loading = true;
            if (this.type === "name") {
                this.MetricService.setServiceDescription(this.serviceName, this.value)
                    .then(response => this.$uibModalInstance.close(response))
                    .catch(err => this.$uibModalInstance.dismiss(err))
                    .finally(() => {
                        this.loading = false;
                    });
            }

        }

        cancel () {
            this.$uibModalInstance.dismiss();
        }

    }

    angular.module("managerApp").controller("MetricsDashboardEditCtrl", MetricsDashboardEditCtrl);
})();
