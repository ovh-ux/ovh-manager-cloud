class AddBackupStorageCtrl {
    constructor ($translate, $uibModalInstance, ControllerHelper, CloudMessage, serviceName, VpsService) {
        this.$translate = $translate;
        this.$uibModalInstance = $uibModalInstance;
        this.ControllerHelper = ControllerHelper;
        this.serviceName = serviceName;
        this.CloudMessage = CloudMessage;
        this.VpsService = VpsService;

        this.loader = {
            init: false,
            save: false
        };
        this.available = [];
        this.model = {
            ip: null,
            ftp: false,
            cifs: false,
            nfs: false
        };
    }

    $onInit () {
        this.loader.init = true;
        this.loadAvailableIpBlocks();
    }

    isAvailable () {
        return !_.isEmpty(this.available);
    }

    validateCheckboxes () {
        return this.model.ftp || this.model.cifs || this.model.nfs;
    }

    loadAvailableIpBlocks () {
        this.ipBlocks = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () => this.VpsService.getBackupStorageAuthorizableBlocks(this.serviceName)
                .then(data => { this.available = data; })
                .catch(() => this.CloudMessage.error(this.$translate.instant("vps_backup_storage_access_add_ip_failure")))
                .finally(() => { this.loader.init = false; })
        });
        this.ipBlocks.load();
    }

    cancel () {
        this.$uibModalInstance.dismiss();
    }

    confirm () {
        if (!this.isAvailable()) {
            return this.cancel();
        }
        this.CloudMessage.flushChildMessage();
        this.addStorage = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () => this.VpsService.postBackupStorageAccess(this.serviceName, this.model.ip, this.model.ftp, this.model.nfs, this.model.cifs)
                .then(data => {
                    if (data.state === "ERROR") {
                        this.CloudMessage.error(data.messages[0].message || this.$translate.instant("vps_backup_storage_access_add_failure"));
                    } else {
                        this.CloudMessage.success(this.$translate.instant("vps_backup_storage_access_add_success"));
                    }
                })
                .catch(err => this.CloudMessage.error(err || this.$translate.instant("vps_backup_storage_access_add_failure")))
                .finally(() => this.$uibModalInstance.close())
        });
        return this.addStorage.load();
    }
}

angular.module("managerApp").controller("AddBackupStorageCtrl", AddBackupStorageCtrl);
