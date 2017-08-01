(() => {
    class CloudProjectComputeInfrastructureModalLoginInformationCtrl {
        constructor ($uibModal, $state, $stateParams) {
            this.$uibModal = $uibModal;
            this.$state = $state;
            this.$stateParams = $stateParams;
        }

        $onInit () {
            this.openLoginInformations();
        }

        openLoginInformations () {
            const modal = this.$uibModal.open({
                templateUrl: "app/cloud/project/compute/infrastructure/virtualMachine/loginInformation/cloud-project-compute-infrastructure-virtual-machine-login-information.html",
                controller: "CloudProjectComputeInfrastructureVirtualMachineLoginInformationCtrl",
                controllerAs: "VmLoginInformationCtrl",
                size: "md",
                resolve: {
                    params: () => ({
                        serviceName: this.$stateParams.projectId,
                        id: this.$stateParams.instanceId,
                        ipAddresses: this.$stateParams.ipAddresses || null,
                        image: this.$stateParams.image || null
                    })
                }
            });

            modal.result
                .then((id) => {
                    this.$state.go("iaas.pci-project.compute.infrastructure", { openVncWithId: id });
                })
                .catch(() => {
                    this.$state.go("iaas.pci-project.compute.infrastructure");
                });
        }
    }

    angular.module("managerApp").controller("CloudProjectComputeInfrastructureModalLoginInformationCtrl", CloudProjectComputeInfrastructureModalLoginInformationCtrl);
})();
