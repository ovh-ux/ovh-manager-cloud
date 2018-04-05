class CloudProjectComputeInfrastructureService {
    constructor ($rootScope, $state, $translate, $uibModal, CloudMessage, CloudUserPref, CloudProjectComputeInfrastructureOrchestrator, ControllerHelper, ServiceHelper) {
        this.$rootScope = $rootScope;
        this.$state = $state;
        this.$translate = $translate;
        this.$uibModal = $uibModal;
        this.CloudMessage = CloudMessage;
        this.CloudUserPref = CloudUserPref;
        this.CloudProjectComputeInfrastructureOrchestrator = CloudProjectComputeInfrastructureOrchestrator;
        this.ControllerHelper = ControllerHelper;
        this.ServiceHelper = ServiceHelper;
    }

    buyIpFailOver () {
        return this.$uibModal.open({
            windowTopClass: "cui-modal",
            templateUrl: "app/cloud/project/compute/infrastructure/ip/failover/buy/cloud-project-compute-infrastructure-ip-failover-buy.html",
            controller: "CloudProjectComputeInfrastructureIpFailoverBuyCtrl",
            controllerAs: "CPCIIpFailoverBuyCtrl"
        }).result;
    }

    importIpFailOver (pendingImportIps) {
        return this.$uibModal.open({
            windowTopClass: "cui-modal",
            templateUrl: "app/cloud/project/compute/infrastructure/ip/failover/import/cloud-project-compute-infrastructure-ip-failover-import.html",
            controller: "CloudProjectComputeInfrastructureIpFailoverImportCtrl",
            controllerAs: "CPCIIpFailoverImportCtrl",
            resolve: {
                pendingImportIps: () => angular.copy(pendingImportIps)
            }
        }).result;
    }

    openLoginInformations (vm) {
        return this.$uibModal.open({
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
        }).result;
    }

    openDeleteProjectModal () {
        return this.$uibModal.open({
            windowTopClass: "cui-modal",
            templateUrl: "app/cloud/project/delete/cloud-project-delete.html",
            controller: "CloudProjectDeleteCtrl",
            controllerAs: "CloudProjectDeleteCtrl"
        }).result;
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
        return this.$uibModal.open({
            windowTopClass: "cui-modal",
            templateUrl: "app/cloud/project/compute/snapshot/add/cloud-project-compute-snapshot-add.html",
            controller: "CloudProjectComputeSnapshotAddCtrl",
            controllerAs: "CloudProjectComputeSnapshotAddCtrl",
            resolve: {
                params: () => vm
            }
        }).result;
    }

    openVnc (vm) {
        return this.$uibModal.open({
            windowTopClass: "cui-modal",
            templateUrl: "app/cloud/project/compute/infrastructure/virtualMachine/vnc/cloud-project-compute-infrastructure-virtual-machine-vnc.html",
            controller: "CloudProjectComputeInfrastructureVirtualmachineVncCtrl",
            controllerAs: "VmVncCtrl",
            size: "lg",
            resolve: {
                params: () => vm
            }
        }).result;
    }

    rebootVirtualMachine (vm, type) {
        return this.ControllerHelper.modal.showConfirmationModal({
            titleText: type === "hard" ? this.$translate.instant("cpci_vm_action_reboot_hard") : this.$translate.instant("cpci_vm_action_reboot"),
            text: this.$translate.instant("cpci_vm_confirm_reboot", { name: vm.name || "" })
        }).then(() => this.CloudProjectComputeInfrastructureOrchestrator.rebootVm(vm, type)
            .then(this.ServiceHelper.successHandler("cpci_vm_reboot_submit_success"))
            .catch(this.ServiceHelper.errorHandler("cpci_vm_reboot_submit_error"))
        );
    }

    reinstallVirtualMachine (vm) {
        return this.ControllerHelper.modal.showConfirmationModal({
            titleText: this.$translate.instant("cpci_vm_action_reinstall"),
            text: this.$translate.instant("cpci_vm_reinstall_warn")
        }).then(() => this.CloudProjectComputeInfrastructureOrchestrator.reinstallVm(vm)
            .catch(this.ServiceHelper.errorHandler("cpci_vm_reinstall_submit_error"))
        );
    }

    deleteVirtualMachine (vm) {
        this.$uibModal.open({
            windowTopClass: "cui-modal",
            templateUrl: "app/cloud/project/compute/infrastructure/virtualMachine/delete/cloud-project-compute-infrastructure-virtual-machine-delete.html",
            controller: "CloudprojectcomputeinfrastructurevirtualmachinedeleteCtrl",
            controllerAs: "$ctrl",
            resolve: {
                params: () => vm
            }
        }).result.then(() => this.CloudProjectComputeInfrastructureOrchestrator.deleteVm(vm)
            .catch(this.ServiceHelper.errorHandler("cpci_vm_delete_submit_error"))
        );
    }

    rescueMode (vm) {
        return this.$uibModal.open({
            windowTopClass: "cui-modal",
            templateUrl: "app/cloud/project/compute/infrastructure/virtualMachine/rescue/cloud-project-compute-infrastructure-virtual-machine-rescue.html",
            controller: "CloudProjectComputeInfrastructureVirtualmachineRescueCtrl",
            controllerAs: "VmRescueCtrl",
            size: "md",
            resolve: {
                params: () => vm
            }
        }).result;
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
        return this.CloudProjectComputeInfrastructureOrchestrator.rescueVm(vm, enable)
            .then(() => {
                _.set(vm, "confirm", null);
            })
            .catch(this.ServiceHelper.errorHandler("cpci_vm_rescue_end_error"))
            .finally(() => {
                vm.confirmLoading = false;
            });
    }

    addVirtualMachine () {
        return this.$state.go("iaas.pci-project.compute.infrastructure", {
            createNewVm: true,
            createNewVolume: false,
            editVm: null,
            monitorVm: null
        });
    }

    addVolume () {
        return this.$state.go("iaas.pci-project.compute.infrastructure", {
            createNewVm: false,
            createNewVolume: true,
            editVm: null,
            monitorVm: null
        });
    }

    editVirtualMachine (vmId) {
        return this.$state.go("iaas.pci-project.compute.infrastructure", {
            createNewVm: false,
            createNewVolume: false,
            editVm: vmId,
            monitorVm: null
        });
    }

    monitorVirtualMachine (vmId) {
        return this.$state.go("iaas.pci-project.compute.infrastructure", {
            createNewVm: false,
            createNewVolume: false,
            editVm: null,
            monitorVm: vmId
        });
    }

    setPreferredView (view) {
        if (_.includes(["diagram", "list"], view)) {
            this.CloudUserPref.set("CLOUD_PROJECT_INFRA_PREFERRED_VIEW", {
                view
            });
        }
    }

    getPreferredView () {
        return this.CloudUserPref.get("CLOUD_PROJECT_INFRA_PREFERRED_VIEW")
            .then(view => _.get(view, "view", "diagram"));
    }
}

angular.module("managerApp").service("CloudProjectComputeInfrastructureService", CloudProjectComputeInfrastructureService);
