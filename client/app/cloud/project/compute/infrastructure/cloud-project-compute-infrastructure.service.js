class CloudProjectComputeInfrastructureService {
    constructor ($rootScope, $uibModal) {
        this.$rootScope = $rootScope;
        this.$uibModal = $uibModal;
    }

    openLoginInformations (vm) {
        this.$uibModal.open({
            templateUrl: "app/cloud/project/compute/infrastructure/virtualMachine/loginInformation/cloud-project-compute-infrastructure-virtual-machine-login-information.html",
            controller: "CloudProjectComputeInfrastructureVirtualMachineLoginInformationCtrl",
            controllerAs: "VmLoginInformationCtrl",
            size: "md",
            resolve: {
                params: () => ({
                    serviceName: vm.serviceName,
                    id: vm.id,
                    ipAddresses: vm.ipAddresses,
                    image: vm.image
                })
            }
        });
    }

    openDeleteProjectModal () {
        this.$uibModal.open({
            windowTopClass: "cui-modal",
            templateUrl: "app/cloud/project/delete/cloud-project-delete.html",
            controller: "CloudProjectDeleteCtrl",
            controllerAs: "CloudProjectDeleteCtrl"
        });
    }

    openMonthlyConfirmation (vm) {
        this.$uibModal.open({
            windowTopClass: "cui-modal",
            templateUrl: "app/cloud/project/compute/infrastructure/virtualMachine/monthlyConfirm/cloud-project-compute-infrastructure-virtual-machine-monthlyConfirm.html",
            controller: "CloudProjectComputeInfrastructureVirtualmachineMonthlyConfirm",
            controllerAs: "CPCIVirtualmachineMonthlyConfirm",
            resolve: {
                params: () => vm
            }
        }).result.then(() => {
            this.$rootScope.$broadcast("infra.refresh.links");
        });
    }

    openSnapshotWizard (vm) {
        this.$uibModal.open({
            windowTopClass: "cui-modal",
            templateUrl: "app/cloud/project/compute/snapshot/add/cloud-project-compute-snapshot-add.html",
            controller: "CloudProjectComputeSnapshotAddCtrl",
            controllerAs: "CloudProjectComputeSnapshotAddCtrl",
            resolve: {
                params: () => vm
            }
        });
    }

    openVnc (vm) {
        this.$uibModal.open({
            windowTopClass: "cui-modal",
            templateUrl: "app/cloud/project/compute/infrastructure/virtualMachine/vnc/cloud-project-compute-infrastructure-virtual-machine-vnc.html",
            controller: "CloudProjectComputeInfrastructureVirtualmachineVncCtrl",
            controllerAs: "VmVncCtrl",
            size: "lg",
            resolve: {
                params: () => vm
            }
        });
    }

    rescueMode (vm) {
        this.$uibModal.open({
            windowTopClass: "cui-modal",
            templateUrl: "app/cloud/project/compute/infrastructure/virtualMachine/rescue/cloud-project-compute-infrastructure-virtual-machine-rescue.html",
            controller: "CloudProjectComputeInfrastructureVirtualmachineRescueCtrl",
            controllerAs: "VmRescueCtrl",
            size: "md",
            resolve: {
                params: () => vm
            }
        });
    }
}

angular.module("managerApp").service("CloudProjectComputeInfrastructureService", CloudProjectComputeInfrastructureService);
