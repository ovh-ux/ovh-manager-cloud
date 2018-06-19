class VpsTakeSnapshotCtrl {
    constructor ($translate, $uibModalInstance, ControllerHelper, CloudMessage, serviceName, VpsService) {
        this.$translate = $translate;
        this.$uibModalInstance = $uibModalInstance;
        this.CloudMessage = CloudMessage;
        this.serviceName = serviceName;
        this.VpsService = VpsService;
        this.ControllerHelper = ControllerHelper;
        this.snapshot = {
            description: ""
        };
    }

    cancel () {
        this.$uibModalInstance.dismiss();
    }

    confirm () {
        this.save = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () => this.VpsService.takeSnapshot(this.serviceName, this.snapshot)
                .then(() => this.CloudMessage.success(this.$translate.instant("vps_configuration_snapshot_take_success", { serviceName: this.serviceName })))
                .catch(err => this.CloudMessage.error(err.message || this.$translate.instant("vps_configuration_snapshot_take_fail")))
                .finally(() => this.$uibModalInstance.close())
        });
        return this.save.load();
    }
}

angular.module("managerApp").controller("VpsTakeSnapshotCtrl", VpsTakeSnapshotCtrl);
