class VpsDisplayIpsCtrl {
    constructor ($translate, $uibModalInstance, CloudMessage, serviceName, VpsService) {
        this.$translate = $translate;
        this.$uibModalInstance = $uibModalInstance;
        this.CloudMessage = CloudMessage;
        this.serviceName = serviceName;
        this.VpsService = VpsService;

        this.loader = {
            init: false
        };

        this.ips = [];
    }

    $onInit () {
        this.loader.init = true;
        this.VpsService.getIps(this.serviceName)
            .then(data => { this.ips = data.results; })
            .catch(() => this.CloudMessage.error(this.$translate.instant("vps_configuration_reversedns_fail")))
            .finally(() => { this.loader.init = false; });
    }

    cancel () {
        this.$uibModalInstance.dismiss();
    }

}

angular.module("managerApp").controller("VpsDisplayIpsCtrl", VpsDisplayIpsCtrl);
