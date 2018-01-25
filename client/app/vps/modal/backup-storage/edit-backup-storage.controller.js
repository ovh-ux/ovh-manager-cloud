class EditBackupStorageCtrl {
    constructor ($translate, $uibModalInstance, row, CloudMessage, serviceName, VpsService) {
        this.$translate = $translate;
        this.$uibModalInstance = $uibModalInstance;
        this.row = row;
        this.serviceName = serviceName;
        this.CloudMessage = CloudMessage;
        this.VpsService = VpsService;

        this.loader = {
            save: false
        };

        this.model = {
            ftp: row.ftp,
            nfs: row.nfs,
            cifs: row.cifs
        };
    }

    validateCheckboxes () {
        return this.model.ftp || this.model.cifs || this.model.nfs;
    }

    cancel () {
        this.$uibModalInstance.dismiss();
    }

    confirm () {
        this.loader.save = true;
        this.VpsService.putBackupStorageAccess(this.serviceName, this.row.ipBlock, this.model.ftp, this.model.nfs, this.model.cifs)
            .then(() => this.CloudMessage.success(this.$translate.instant("vps_tab_backup_storage_set_success", {access: this.row.ipBlock})))
            .catch(() => this.CloudMessage.error(this.$translate.instant("vps_tab_backup_storage_set_fail", {access: this.row.ipBlock})))
            .finally(() => {
                this.loader.save = false;
                this.$uibModalInstance.close();
            });
    }
}

angular.module("managerApp").controller("EditBackupStorageCtrl", EditBackupStorageCtrl);
