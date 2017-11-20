class VpsMountCtrl {
    constructor ($translate, $uibModalInstance, CloudMessage, RestorePoint, VpsService) {
        this.$translate = $translate;
        this.$uibModalInstance = $uibModalInstance;
        this.CloudMessage = CloudMessage;
        this.RestorePoint = RestorePoint;
        this.VpsService = VpsService;

        this.attachedBackup = null;
        this.loader = {
            init: false,
            save: false
        };
    }

    $onInit () {
        this.loader.init = true;
        this.VpsService.getVeeamAttachedBackup()
            .then(data => { this.attachedBackup = data.length })
            .catch(err => this.CloudMessage.error(err))
            .finally(() => { this.loader.init = false });
    }

    cancel () {
        this.$uibModalInstance.dismiss();

    }

    confirm () {
        this.loader.save = true;
        this.VpsService.veeamRestorePointMount(this.RestorePoint)
            .then(() => this.CloudMessage.success(this.$translate.instant("vps_configuration_veeam_mount_success")))
            .catch(() => this.CloudMessage.error(this.$translate.instant("vps_configuration_veeam_mount_fail")))
            .finally(() => {
                this.loader.save = false;
                this.$uibModalInstance.close();
            });
    }


}

angular.module("managerApp").controller("VpsMountCtrl", VpsMountCtrl);
