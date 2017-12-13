class VpsOptionTerminateCtrl {
    constructor ($translate, $uibModalInstance, CloudMessage, serviceName, VpsService, vpsOption) {
        this.$translate = $translate;
        this.$uibModalInstance = $uibModalInstance;
        this.CloudMessage = CloudMessage;
        this.serviceName = serviceName;
        this.VpsService = VpsService;

        this.vpsOption = vpsOption;

        this.TITLES = {
            additionalDisk: "vps_configuration_cancel_option_title_additionaldisk",
            automatedBackup: "vps_configuration_cancel_option_title_automatedbackup",
            ftpBackup: "vps_configuration_cancel_option_title_ftpbackup",
            snapshot: "vps_configuration_cancel_option_title_snapshot",
            veeam: "vps_configuration_cancel_option_title_veeam",
            windows: "vps_configuration_cancel_option_title_windows"
        };

        this.loader = {
            init: false,
            save: false
        };
    }

    $onInit () {
        this.loader.init = true;
        this.VpsService.getSelectedVps(this.serviceName)
            .then(vps => this.expirationDate = moment(vps.expiration))
            .catch(() => this.CloudMessage.success(this.$translate.instant("vps_configuration_cancel_option_cancel_error")))
            .finally(() => { this.loader.init = false; });
    }

    cancel () {
        this.$uibModalInstance.dismiss();
    }

    confirm () {
        this.loader.save = true;
        this.VpsService.cancelOption(this.serviceName, this.vpsOption)
            .then(() => this.CloudMessage.success(this.$translate.instant("vps_configuration_cancel_option_cancel_success")))
            .catch(() => this.CloudMessage.error(this.$translate.instant("vps_configuration_cancel_option_cancel_error")))
            .finally(() => {
                this.loader.save = false;
                this.$uibModalInstance.close();
            });
    }
}

angular.module("managerApp").controller("VpsOptionTerminateCtrl", VpsOptionTerminateCtrl);
