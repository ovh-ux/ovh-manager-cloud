class VpsPasswordCtrl {
    constructor ($translate, $uibModalInstance, CloudMessage, ovhDocUrl, serviceName, VpsService) {
        this.$translate = $translate;
        this.$uibModalInstance = $uibModalInstance;
        this.CloudMessage = CloudMessage;
        this.ovhDocUrl = ovhDocUrl;
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
        this.guide = this.ovhDocUrl.getDocUrl("vps/root-password");
        this.VpsService.getTaskInError(this.serviceName)
            .then(tasks => {
                if (tasks.length) {
                    this.CloudMessage.error(this.$translate.instant("vps_configuration_polling_fail"));
                }
            })
            .catch(err => this.CloudMessage.error(err))
            .finally(() => { this.loader.init = false });
    }

    cancel () {
        this.$uibModalInstance.dismiss();
    }

    confirm () {
        this.loader.save = true;
        this.VpsService.reboot(this.serviceName, this.selected.rescue)
            .then(() => this.CloudMessage.success(this.$translate.instant("vps_configuration_reboot_rescue_success", {serviceName: this.serviceName})))
            .catch(() => this.CloudMessage.error(this.$translate.instant("vps_configuration_reinitpassword_fail")))
            .finally(() => {
                this.loader.save = false;
                this.$uibModalInstance.close();
            });
    }
}

angular.module("managerApp").controller("VpsPasswordCtrl", VpsPasswordCtrl);
