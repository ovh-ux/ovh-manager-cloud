(() => {
    class CloudProjectComputeInfrastructureCtrl {
        constructor ($state) {
            this.$state = $state;
        }

        $onInit () {
            if (this.$state.is("iaas.pci-project.compute.infrastructure")) {
                this.$state.go("iaas.pci-project.compute.infrastructure.diagram");
            }
        }
    }

    angular.module("managerApp").controller("CloudProjectComputeInfrastructureCtrl", CloudProjectComputeInfrastructureCtrl);
})();
