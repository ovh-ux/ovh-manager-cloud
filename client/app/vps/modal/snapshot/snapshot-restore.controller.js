class VpsRestoreSnapshotCtrl {
    constructor ($translate, $uibModalInstance, ControllerHelper, CloudMessage, serviceName, VpsService) {
        this.$translate = $translate;
        this.$uibModalInstance = $uibModalInstance;
        this.CloudMessage = CloudMessage;
        this.serviceName = serviceName;
        this.VpsService = VpsService;
        this.ControllerHelper = ControllerHelper;
        this.summary = {};

    }

    $onInit () {
        this.snapshotSummary = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () => this.VpsService.getTabSummary(this.serviceName)
                .then(data => {
                    this.summary = data;
                    this.date = moment(data.snapshot.creationDate).format("LLL");
                })
                .catch(error => this.CloudMessage.error(error.message || this.$translate.instant("vps_configuration_snapshot_restore_fail")))
        });
        return this.snapshotSummary.load();
    }

    cancel () {
        this.$uibModalInstance.dismiss();
    }

    confirm () {
        this.restore = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () => this.VpsService.restoreSnapshot(this.serviceName)
                .then(() => this.CloudMessage.success(this.$translate.instant("vps_configuration_snapshot_restore_success", { serviceName: this.serviceName })))
                .catch(error => this.CloudMessage.error(error.message || this.$translate.instant("vps_configuration_snapshot_restore_fail")))
                .finally(() => this.$uibModalInstance.close())
        });
        return this.restore.load();
    }
}

angular.module("managerApp").controller("VpsRestoreSnapshotCtrl", VpsRestoreSnapshotCtrl);
