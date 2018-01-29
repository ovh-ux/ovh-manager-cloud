class VpsTakeSnapshotCtrl {
    constructor ($translate, $uibModalInstance, CloudMessage, serviceName, VpsService) {
        this.$translate = $translate;
        this.$uibModalInstance = $uibModalInstance;
        this.CloudMessage = CloudMessage;
        this.serviceName = serviceName;
        this.VpsService = VpsService;

        this.loader = {
            save: false
        };

        this.snapshot = {
            description: ""
        };
    }

    cancel () {
        this.$uibModalInstance.dismiss();
    }

    confirm () {
        this.loader.save = true;
        this.VpsService.takeSnapshot(this.serviceName, this.snapshot)
            .then(() => this.CloudMessage.success(this.$translate.instant("vps_configuration_snapshot_take_success", {serviceName: this.serviceName})))
            .catch(err => this.CloudMessage.error(err.message || this.$translate.instant("vps_configuration_snapshot_take_fail")))
            .finally(() => {
                this.loader.save = false;
                this.$uibModalInstance.close();
            });
    }
}

angular.module("managerApp").controller("VpsTakeSnapshotCtrl", VpsTakeSnapshotCtrl);
