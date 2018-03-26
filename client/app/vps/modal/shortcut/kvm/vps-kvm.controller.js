class VpsKvmCtrl {
    constructor ($sce, $translate, $uibModalInstance, CloudMessage, noVNC, serviceName, VpsService) {
        this.$sce = $sce;
        this.$translate = $translate;
        this.$uibModalInstance = $uibModalInstance;
        this.CloudMessage = CloudMessage;
        this.noVNC = noVNC;
        this.serviceName = serviceName;
        this.VpsService = VpsService;

        this.loader = {
            init: true,
            kvm: false
        };

        this.consoleUrl = null;
        this.kvm = {};
    }

    $onInit () {
        this.loader.init = true;
        if (this.noVNC) {
            this.loadKvm();
        } else {
            this.kvmUrl();
        }
    }

    kvmUrl () {
        this.VpsService.getKVMConsoleUrl(this.serviceName)
            .then(data => {
                this.consoleUrl = this.$sce.trustAsResourceUrl(data);
            })
            .catch(() => this.CloudMessage.error(this.$translate.instant("vps_configuration_kvm_fail")))
            .finally(() => { this.loader.init = false; });
    }

    loadKvm () {
        this.VpsService.getKVMAccess(this.serviceName)
            .then(data => { this.kvm = data; })
            .catch(() => this.CloudMessage.error(this.$translate.instant("vps_configuration_kvm_fail")))
            .finally(() => { this.loader.init = false; });
    }

    close () {
        this.$uibModalInstance.dismiss();
    }
}

angular.module("managerApp").controller("VpsKvmCtrl", VpsKvmCtrl);
