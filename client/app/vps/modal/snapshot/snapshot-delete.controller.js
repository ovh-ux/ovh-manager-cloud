class VpsDeleteSnapshotCtrl {
    constructor ($translate, $uibModalInstance, CloudMessage, serviceName, VpsService) {
        this.$translate = $translate;
        this.$uibModalInstance = $uibModalInstance;
        this.CloudMessage = CloudMessage;
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
        this.VpsService.deleteSnapshot(this.serviceName)
            .then(() => this.CloudMessage.success(this.$translate.instant("vps_configuration_delete_snapshot_success", {serviceName: this.serviceName})))
            .catch(error => this.CloudMessage.error(error.message || this.$translate.instant("vps_configuration_delete_snapshot_fail")))
            .finally(() => {
                this.loader.save = false;
                this.$uibModalInstance.close();
            });
    }
}

angular.module("managerApp").controller("VpsDeleteSnapshotCtrl", VpsDeleteSnapshotCtrl);
