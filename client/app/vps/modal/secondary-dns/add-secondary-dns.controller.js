class AddSecondaryDnsCtrl {
    constructor ($translate, $uibModalInstance, CloudMessage, VpsService) {
        this.$translate = $translate;
        this.$uibModalInstance = $uibModalInstance;
        this.CloudMessage = CloudMessage;
        this.VpsService = VpsService;

        this.loader = {
            init: false,
            save: false
        };
        this.available = null;
        this.model;
    }

    $onInit () {
        this.loader.init = true;
        this.loadAvailableDns();
    }

    loadAvailableDns () {
        this.VpsService.getSecondaryDNSAvailable()
            .then(data => { this.available = data })
            .catch(() => this.CloudMessage.error(this.$translate.instant("vps_configuration_secondarydns_add_fail")))
            .finally(() => { this.loader.init = false });
    }

    cancel () {
        this.$uibModalInstance.dismiss();

    }

    confirm () {
        this.loader.save = true;
        this.VpsService.addSecondaryDnsDomain(this.model)
            .then(() => this.CloudMessage.success(this.$translate.instant("vps_configuration_secondarydns_add_success")))
            .catch(() => this.CloudMessage.error(this.$translate.instant("vps_configuration_secondarydns_add_fail")))
            .finally(() => {
                this.loader.save = false;
                this.$uibModalInstance.close();
            })

    }


}

angular.module("managerApp").controller("AddSecondaryDnsCtrl", AddSecondaryDnsCtrl);
