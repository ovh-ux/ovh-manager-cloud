(() => {
    class CloudProjectComputeInfrastructureCtrl {
        constructor ($state, CLOUD_MONITORING) {
            this.$state = $state;
            this.CLOUD_MONITORING = CLOUD_MONITORING;
        }

        $onInit () {
            this.vmMonitoringUpgradeThreshold = this.CLOUD_MONITORING.vm.upgradeAlertThreshold;

            if (this.$state.is("iaas.pci-project.compute.infrastructure")) {
                this.$state.go("iaas.pci-project.compute.infrastructure.diagram");
            }
        }
    }

    angular.module("managerApp").controller("CloudProjectComputeInfrastructureCtrl", CloudProjectComputeInfrastructureCtrl);
})();
