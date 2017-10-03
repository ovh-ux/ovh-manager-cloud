(() => {
    class MetricsDashboardEditCtrl {
        constructor ($translate, $uibModalInstance, metricsValue, metricsType, serviceName, CloudMessage, MetricService) {
            this.$translate = $translate;
            this.$uibModalInstance = $uibModalInstance;
            this.serviceName = serviceName;
            this.CloudMessage = CloudMessage;
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
                        this.CloudMessage.success(this.$translate.instant("metrics_setting_name_updated"));
                    });
            }

        }

        cancel () {
            this.$uibModalInstance.dismiss();
        }

    }

    angular.module("managerApp").controller("MetricsDashboardEditCtrl", MetricsDashboardEditCtrl);
})();
