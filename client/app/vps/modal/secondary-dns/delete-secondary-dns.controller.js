class DeleteSecondaryDnsCtrl {
    constructor ($translate, $uibModalInstance, CloudMessage, domain, serviceName, VpsService) {
        this.$translate = $translate;
        this.$uibModalInstance = $uibModalInstance;
        this.CloudMessage = CloudMessage;
        this.domain = domain;
        this.serviceName = serviceName;
        this.VpsService = VpsService;

        this.loader = {
            save: false
        };
    }

    cancel () {
        this.$uibModalInstance.dismiss();
    }

    confirm () {
        this.loader.save = true;
        this.VpsService.deleteSecondaryDnsDomain(this.serviceName, this.domain.domain)
            .then(() => this.CloudMessage.success(this.$translate.instant("vps_configuration_secondarydns_delete_success")))
            .catch(() => this.CloudMessage.error(this.$translate.instant("vps_configuration_secondarydns_delete_fail", { domain: this.domain.domain })))
            .finally(() => {
                this.loader.save = false;
                this.$uibModalInstance.close();
            })

    }
}

angular.module("managerApp").controller("DeleteSecondaryDnsCtrl", DeleteSecondaryDnsCtrl);
