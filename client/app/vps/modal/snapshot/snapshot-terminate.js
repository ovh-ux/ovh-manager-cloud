class VpsTerminateSnapshotCtrl {
    constructor ($translate, $uibModalInstance, CloudMessage, serviceName, VpsService) {
        this.$translate = $translate;
        this.$uibModalInstance = $uibModalInstance;
        this.CloudMessage = CloudMessage;
        this.serviceName = serviceName;
        this.VpsService = VpsService;

        this.loader = {
            init: false,
            save: false
        };
    }

    $onInit () {
        this.loader.init = true;
        this.VpsService.getSelectedVps(this.serviceName)
            .then(vps => this.expirationDate = moment(vps.expiration).format("LL"))
            .catch(() => this.CloudMessage.success(this.$translate.instant("vps_configuration_cancel_option_cancel_error")))
            .finally(() => {this.loader.init = false});
    }

    cancel () {
        this.$uibModalInstance.dismiss();
    }

    confirm () {
        this.loader.save = true;
        this.VpsService.cancelOption(this.serviceName, "snapshot")
            .then(() => this.CloudMessage.success(this.$translate.instant("vps_configuration_cancel_option_cancel_success")))
            .catch(() => this.CloudMessage.error(this.$translate.instant("vps_configuration_cancel_option_cancel_error")))
            .finally(() => {
                this.loader.save = false;
                this.$uibModalInstance.close();
            });
    }
}

angular.module("managerApp").controller("VpsTerminateSnapshotCtrl", VpsTerminateSnapshotCtrl);
