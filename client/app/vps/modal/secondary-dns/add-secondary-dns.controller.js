class AddSecondaryDnsCtrl {
    constructor ($translate, $uibModalInstance, ControllerHelper, CloudMessage, serviceName, VpsService) {
        this.$translate = $translate;
        this.$uibModalInstance = $uibModalInstance;
        this.serviceName = serviceName;
        this.CloudMessage = CloudMessage;
        this.VpsService = VpsService;
        this.ControllerHelper = ControllerHelper;
        this.available = null;
        this.model = null;
    }

    $onInit () {
        this.loadAvailableDns();
    }

    loadAvailableDns () {
        this.availableDns = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () => this.VpsService.getSecondaryDNSAvailable(this.serviceName)
                .then(data => { this.available = data; })
                .catch(() => this.CloudMessage.error(this.$translate.instant("vps_configuration_secondarydns_add_fail")))
        });
        this.availableDns.load();
    }

    cancel () {
        this.$uibModalInstance.dismiss();
    }

    confirm () {
        this.CloudMessage.flushChildMessage();
        this.addDns = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () => this.VpsService.addSecondaryDnsDomain(this.serviceName, this.model)
                .then(() => this.CloudMessage.success(this.$translate.instant("vps_configuration_secondarydns_add_success", { domain: this.model })))
                .catch(err => this.CloudMessage.error(err.message))
                .finally(() => this.$uibModalInstance.close())
        });
        this.addDns.load();
    }
}

angular.module("managerApp").controller("AddSecondaryDnsCtrl", AddSecondaryDnsCtrl);
