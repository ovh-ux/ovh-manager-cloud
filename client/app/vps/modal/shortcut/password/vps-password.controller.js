class VpsPasswordCtrl {
    constructor ($translate, $uibModalInstance, ControllerHelper, CloudMessage, ovhDocUrl, serviceName, VpsService) {
        this.$translate = $translate;
        this.$uibModalInstance = $uibModalInstance;
        this.CloudMessage = CloudMessage;
        this.ovhDocUrl = ovhDocUrl;
        this.serviceName = serviceName;
        this.VpsService = VpsService;
        this.ControllerHelper = ControllerHelper;

        this.selected = {
            rescue: true
        };
    }

    $onInit () {
        this.guide = this.ovhDocUrl.getDocUrl("vps/root-password");
        this.tasks = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () => this.VpsService.getTaskInError(this.serviceName)
                .then(tasks => {
                    if (tasks.length) {
                        this.CloudMessage.error(this.$translate.instant("vps_configuration_polling_fail"));
                    }
                })
                .catch(err => this.CloudMessage.error(err))
        });
        return this.tasks.load();
    }

    cancel () {
        this.$uibModalInstance.dismiss();
    }

    confirm () {
        this.save = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () => this.VpsService.reboot(this.serviceName, this.selected.rescue)
                .then(() => this.CloudMessage.success(this.$translate.instant("vps_configuration_reboot_rescue_success", { serviceName: this.serviceName })))
                .catch(() => this.CloudMessage.error(this.$translate.instant("vps_configuration_reinitpassword_fail")))
                .finally(() => this.$uibModalInstance.close())
        });
        return this.save.load();
    }
}

angular.module("managerApp").controller("VpsPasswordCtrl", VpsPasswordCtrl);
