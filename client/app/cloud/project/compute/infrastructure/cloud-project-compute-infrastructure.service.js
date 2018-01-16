class CloudProjectComputeInfrastructureService {
    constructor ($rootScope, $translate, $uibModal, CloudMessage, CloudProjectComputeInfrastructureOrchestrator, ControllerHelper) {
        this.$rootScope = $rootScope;
        this.$translate = $translate;
        this.$uibModal = $uibModal;
        this.CloudMessage = CloudMessage;
        this.CloudProjectComputeInfrastructureOrchestrator = CloudProjectComputeInfrastructureOrchestrator;
        this.ControllerHelper = ControllerHelper;
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

    rebootVirtualMachine (vm, type) {
        return this.ControllerHelper.modal.showConfirmationModal({
            titleText: type === "hard" ? this.$translate.instant("cpci_vm_action_reboot_hard") : this.$translate.instant("cpci_vm_action_reboot"),
            text: this.$translate.instant("cpci_vm_confirm_reboot", { name: vm.name || "" })
        }).then(() => this.CloudProjectComputeInfrastructureOrchestrator.rebootVm(vm, type)
            .catch(err => {
                this.CloudMessage.error(`${this.$translate.instant("cpci_vm_reboot_submit_error")} ${_.get(err, "data.message", "")}`);
            })
        );
    }

    reinstallVirtualMachine (vm) {
        return this.ControllerHelper.modal.showConfirmationModal({
            titleText: this.$translate.instant("cpci_vm_action_reinstall"),
            text: this.$translate.instant("cpci_vm_reinstall_warn")
        }).then(() => this.CloudProjectComputeInfrastructureOrchestrator.reinstallVm(vm)
            .catch(err => {
                this.CloudMessage.error(`${this.$translate.instant("cpci_vm_reinstall_submit_error")} ${_.get(err, "data.message", "")}`);
            })
        );
    }

    removeVirtualMachine (vm) {
        this.$uibModal.open({
            windowTopClass: "cui-modal",
            templateUrl: "app/cloud/project/compute/infrastructure/virtualMachine/delete/cloud-project-compute-infrastructure-virtual-machine-delete.html",
            controller: "CloudprojectcomputeinfrastructurevirtualmachinedeleteCtrl",
            controllerAs: "$ctrl",
            resolve: {
                params: () => vm
            }
        }).result.then(() => this.CloudProjectComputeInfrastructureOrchestrator.deleteVm(vm)
            .catch(err => {
                this.CloudMessage.error(`${this.$translate.instant("cpci_vm_delete_submit_error")} ${_.get(err, "data.message", "")}`);
            })
        );
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

    resumeVirtualMachine (vm) {
        const oldStatus = vm.status;
        _.set(vm, "status", "RESUMING");
        return this.CloudProjectComputeInfrastructureOrchestrator.resumeVm(vm)
            .catch(err => {
                this.CloudMessage.error(`${this.$translate.instant("cpci_vm_resume_submit_error")} ${_.get(err, "data.message", "")}`);
                vm.status = oldStatus;
            });
    }

    stopRescueMode (vm, enable) {
        _.set(vm, "confirmLoading", true);
        this.CloudProjectComputeInfrastructureOrchestrator.rescueVm(vm, enable)
            .then(() => {
                _.set(vm, "confirm", null);
            })
            .catch(err => {
                this.CloudMessage.error(`${this.$translate.instant("cpci_vm_rescue_end_error")} ${_.get(err, "data.message", "")}`);
            })
            .finally(() => {
                vm.confirmLoading = false;
            });
    }
}

angular.module("managerApp").service("CloudProjectComputeInfrastructureService", CloudProjectComputeInfrastructureService);
