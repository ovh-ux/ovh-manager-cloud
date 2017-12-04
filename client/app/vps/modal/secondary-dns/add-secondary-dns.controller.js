class AddSecondaryDnsCtrl {
    constructor ($translate, $uibModalInstance, CloudMessage, serviceName, VpsService) {
        this.$translate = $translate;
        this.$uibModalInstance = $uibModalInstance;
        this.serviceName = serviceName;
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
        this.VpsService.getSecondaryDNSAvailable(this.serviceName)
            .then(data => { this.available = data })
            .catch(() => this.CloudMessage.error(this.$translate.instant("vps_configuration_secondarydns_add_fail")))
            .finally(() => { this.loader.init = false });
    }

    cancel () {
        this.$uibModalInstance.dismiss();
    }

    confirm () {
        this.loader.save = true;
        this.VpsService.addSecondaryDnsDomain(this.serviceName, this.model)
            .then(() => this.CloudMessage.success(this.$translate.instant("vps_configuration_secondarydns_add_success")))
            .catch(err => this.CloudMessage.error(err.message))
            .finally(() => {
                this.loader.save = false;
                this.$uibModalInstance.close();
            })

    }
}

angular.module("managerApp").controller("AddSecondaryDnsCtrl", AddSecondaryDnsCtrl);
