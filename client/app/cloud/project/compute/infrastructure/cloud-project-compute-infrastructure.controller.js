(() => {
    class CloudProjectComputeInfrastructureCtrl {
        constructor ($state) {
            this.$state = $state;

            this.init();
        }

        init () {
            this.$state.go("iaas.pci-project.compute.infrastructure.diagram");
        }
    }

    angular.module("managerApp").controller("CloudProjectComputeInfrastructureCtrl", CloudProjectComputeInfrastructureCtrl);
})();
