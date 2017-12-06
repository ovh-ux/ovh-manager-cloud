class PasswordBackupStorageCtrl {
    constructor ($translate, $uibModalInstance, CloudMessage, serviceName, VpsService) {
        this.$translate = $translate;
        this.$uibModalInstance = $uibModalInstance;
        this.serviceName = serviceName;
        this.CloudMessage = CloudMessage;
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
        this.VpsService.requestFtpBackupPassword(this.serviceName)
            .then(() => this.CloudMessage.success(this.$translate.instant("vps_backup_storage_access_forgot_password_success")))
            .catch(() => this.CloudMessage.error(this.$translate.instant("vps_backup_storage_access_forgot_password_failure")))
            .finally(() => {
                this.loader.save = false;
                this.$uibModalInstance.close();
            });
    }
}

angular.module("managerApp").controller("PasswordBackupStorageCtrl", PasswordBackupStorageCtrl);
