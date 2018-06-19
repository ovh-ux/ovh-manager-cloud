class EditBackupStorageCtrl {
    constructor ($q, $translate, $uibModalInstance, ControllerHelper, row, CloudMessage, serviceName, VpsService) {
        this.$q = $q;
        this.$translate = $translate;
        this.$uibModalInstance = $uibModalInstance;
        this.ControllerHelper = ControllerHelper;
        this.row = row;
        this.serviceName = serviceName;
        this.CloudMessage = CloudMessage;
        this.VpsService = VpsService;
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
        this.CloudMessage.flushChildMessage();
        this.loader = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () => this.VpsService.putBackupStorageAccess(this.serviceName, this.row.ipBlock, this.model.ftp, this.model.nfs, this.model.cifs)
                .then(() => this.CloudMessage.success(this.$translate.instant("vps_tab_backup_storage_set_success", { access: this.row.ipBlock })))
                .catch(err => {
                    this.CloudMessage.error(err.data.message);
                    this.CloudMessage.error(this.$translate.instant("vps_tab_backup_storage_set_fail", { access: this.row.ipBlock }));
                })
                .finally(() => this.$uibModalInstance.close())
        });
        return this.loader.load();
    }
}

angular.module("managerApp").controller("EditBackupStorageCtrl", EditBackupStorageCtrl);
