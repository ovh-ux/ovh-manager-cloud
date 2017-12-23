class VpsPasswordCtrl {
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
        this.model = {};
        this.selected = {
            rescue: true
        };
    }

    $onInit () {
        this.loader.init = true;
        this.VpsService.getTaskInError(this.serviceName)
            .then(tasks => { this.hasTasks(tasks) })
            .catch(err => this.CloudMessage.error(err))
            .finally(() => { this.loader.init = false });
    }

    hasTasks (tasks) {
        if (tasks.length) {
            this.CloudMessage.error(this.$translate.instant("vps_configuration_polling_fail"));
        }
    }

    cancel () {
        this.$uibModalInstance.dismiss();
    }

    confirm () {
        this.loader.save = true;
        this.VpsService.reboot(this.serviceName, this.selected.rescue)
            .then(() => this.CloudMessage.success(this.$translate.instant("vps_configuration_reboot_rescue_success")))
            .catch(() => this.CloudMessage.error(this.$translate.instant("vps_configuration_reboot_rescue_fail")))
            .finally(() => {
                this.loader.save = false;
                this.$uibModalInstance.close();
            });
    }
}

angular.module("managerApp").controller("VpsPasswordCtrl", VpsPasswordCtrl);
