class VpsRestoreSnapshotCtrl {
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
        this.summary = {};
    }

    $onInit () {
        this.loader.init = true;
        this.VpsService.getTabSummary(this.serviceName)
            .then(data => {
                this.summary = data;
                this.summary.snapshot.formattedCreationDate = moment(data.snapshot.creationDate).filter('LLL');
            })
            .catch(() => this.CloudMessage.error(this.$translate.instant("vps_configuration_snapshot_restore_fail")))
            .finally(() => {
                this.loader.init = false;
            });
    }

    cancel () {
        this.$uibModalInstance.dismiss();
    }

    confirm () {
        this.loader.save = true;
        this.VpsService.restoreSnapshot(this.serviceName)
            .then(() => this.CloudMessage.success(this.$translate.instant("vps_configuration_snapshot_restore_success")))
            .catch(() => this.CloudMessage.error(this.$translate.instant("vps_configuration_snapshot_restore_fail")))
            .finally(() => {
                this.loader.save = false;
                this.$uibModalInstance.close();
            });
    }
}

angular.module("managerApp").controller("VpsRestoreSnapshotCtrl", VpsRestoreSnapshotCtrl);
