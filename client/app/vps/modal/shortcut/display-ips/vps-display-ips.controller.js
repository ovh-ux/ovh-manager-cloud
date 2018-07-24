class VpsDisplayIpsCtrl {
    constructor ($translate, $uibModalInstance, ControllerHelper, CloudMessage, serviceName, VpsService) {
        this.$translate = $translate;
        this.$uibModalInstance = $uibModalInstance;
        this.CloudMessage = CloudMessage;
        this.serviceName = serviceName;
        this.VpsService = VpsService;
        this.ControllerHelper = ControllerHelper;
        this.ips = [];
    }

    $onInit () {
        this.ipsLoader = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () => this.VpsService.getIps(this.serviceName)
                .then(data => { this.ips = data.results; })
                .catch(() => this.CloudMessage.error(this.$translate.instant("vps_configuration_reversedns_fail")))
        });
        return this.ipsLoader.load();
    }

    cancel () {
        this.$uibModalInstance.dismiss();
    }

}

angular.module("managerApp").controller("VpsDisplayIpsCtrl", VpsDisplayIpsCtrl);
