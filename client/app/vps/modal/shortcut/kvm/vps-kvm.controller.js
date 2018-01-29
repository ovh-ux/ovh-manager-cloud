class VpsKvmCtrl {
    constructor ($sce, $translate, $uibModalInstance, CloudMessage, hasKVM, serviceName, VpsService) {
        this.$sce = $sce;
        this.$translate = $translate;
        this.$uibModalInstance = $uibModalInstance;
        this.CloudMessage = CloudMessage;
        this.hasKVM = hasKVM;
        this.serviceName = serviceName;
        this.VpsService = VpsService;

        this.loader = {
            init: false,
            kvm: false
        };

        this.consoleUrl = null;
        this.kvm = {};
    }

    $onInit () {
        this.loader.init = true;
        this.kvmUrl();
        if (this.hasKVM) {
            this.loadKvm();
        }
    }

    kvmUrl () {
        this.VpsService.getKVMConsoleUrl(this.serviceName)
            .then(data => {
                this.consoleUrl = this.$sce.trustAsResourceUrl(data);
            })
            .catch(() => this.CloudMessage.error(this.$translate.instant("vps_configuration_kvm_fail")))
            .finally(() => { this.loader.init = false });
    }

    loadKvm () {
        this.loader.kvm = true;
        this.VpsService.getKVMAccess()
            .then(data => { this.kvm = data })
            .catch(() => this.CloudMessage.error(this.$translate.instant("vps_configuration_kvm_fail")))
            .finally(() => { this.loader.kvm = false });
    }

    close () {
        this.$uibModalInstance.dismiss();
    }
}

angular.module("managerApp").controller("VpsKvmCtrl", VpsKvmCtrl);
