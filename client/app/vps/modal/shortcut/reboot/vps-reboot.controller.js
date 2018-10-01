class VpsRebootCtrl {
  constructor($translate, $uibModalInstance, ControllerHelper, CloudMessage, serviceName,
    VpsService) {
    this.$translate = $translate;
    this.$uibModalInstance = $uibModalInstance;
    this.CloudMessage = CloudMessage;
    this.serviceName = serviceName;
    this.VpsService = VpsService;
    this.ControllerHelper = ControllerHelper;

    this.loader = {
      init: false,
    };
    this.model = {};
    this.selected = {
      rescue: false,
    };
  }

  $onInit() {
    this.loader.init = true;
    this.VpsService.getTaskInError(this.serviceName)
      .then((tasks) => { this.loadVpsRescueMode(tasks); });
  }

  loadVpsRescueMode(tasks) {
    if (!_(tasks).isArray() || (_(tasks).isArray() && _(tasks).isEmpty())) {
      this.VpsService.getSelectedVps(this.serviceName)
        .then((data) => { this.model = data; })
        .catch(() => this.CloudMessage.error(this.$translate.instant('vps_configuration_reboot_fail')))
        .finally(() => { this.loader.init = false; });
    } else {
      this.CloudMessage.error(this.$translate.instant('vps_configuration_polling_fail'));
      this.loader.init = false;
    }
  }

  cancel() {
    this.$uibModalInstance.dismiss();
  }

  confirm() {
    this.save = this.ControllerHelper.request.getHashLoader({
      loaderFunction: () => this.VpsService.reboot(this.serviceName, this.selected.rescue)
        .then(() => this.CloudMessage.success(this.$translate.instant('vps_configuration_reboot_success', { serviceName: this.serviceName })))
        .catch(() => this.CloudMessage.error(this.$translate.instant('vps_configuration_reboot_fail')))
        .finally(() => this.$uibModalInstance.close()),
    });
    return this.save.load();
  }
}

angular.module('managerApp').controller('VpsRebootCtrl', VpsRebootCtrl);
