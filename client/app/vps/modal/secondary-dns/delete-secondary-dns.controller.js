class DeleteSecondaryDnsCtrl {
    constructor ($translate, $uibModalInstance, ControllerHelper, CloudMessage, domain, serviceName, VpsService) {
        this.$translate = $translate;
        this.$uibModalInstance = $uibModalInstance;
        this.CloudMessage = CloudMessage;
        this.domain = domain;
        this.serviceName = serviceName;
        this.VpsService = VpsService;
        this.ControllerHelper = ControllerHelper;
    }

    cancel () {
        this.$uibModalInstance.dismiss();
    }

    confirm () {
        this.CloudMessage.flushChildMessage();
        this.delete = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () => this.VpsService.deleteSecondaryDnsDomain(this.serviceName, this.domain.domain)
                .then(() => this.CloudMessage.success(this.$translate.instant("vps_configuration_secondarydns_delete_success")))
                .catch(() => this.CloudMessage.error(this.$translate.instant("vps_configuration_secondarydns_delete_fail", { domain: this.domain.domain })))
                .finally(() => this.$uibModalInstance.close())
        });
        this.delete.load();
    }
}

angular.module("managerApp").controller("DeleteSecondaryDnsCtrl", DeleteSecondaryDnsCtrl);
