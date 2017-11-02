class VpsRebootCtrl {
    constructor ($translate, $uibModalInstance, CloudMessage, VpsService) {
        this.$translate = $translate;
        this.$uibModalInstance = $uibModalInstance;
        this.CloudMessage = CloudMessage;
        this.VpsService = VpsService;

        this.loader = {
            init: false,
            save: false
        };
        this.model = {};
        this.selected = {
            rescue: false
        };
    }

    $onInit () {
        this.loader.init = true;
        this.VpsService.getTaskInError()
            .then (tasks => { this.loadVpsRescueMode(tasks) });
    }

    loadVpsRescueMode (tasks) {
        if (!tasks || !tasks.length) {
            this.VpsService.getSelected()
                .then(data => { this.model = data })
                .catch(() => this.CloudMessage.error(this.$translate.instant("vps_configuration_reboot_fail")))
                .finally(() => { this.loader.init = false });
        } else {
            this.CloudMessage.error(this.$translate.instant("vps_configuration_polling_fail"));
            this.loader.init = false;
        }
    }

    cancel () {
        this.$uibModalInstance.dismiss();

    }

    confirm () {
        this.loader.save = true;
        this.VpsService.reboot(this.selected.rescue)
            .then(() => this.CloudMessage.success(this.$translate.instant("vps_configuration_reboot_success")))
            .catch(() => this.CloudMessage.error(this.$translate.instant("vps_configuration_reboot_fail")))
            .finally(() => {
                this.loader.save = false;
                this.$uibModalInstance.close();
            })

    }


}

angular.module("managerApp").controller("VpsRebootCtrl", VpsRebootCtrl);
