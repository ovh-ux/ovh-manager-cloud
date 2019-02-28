class VpsRebootCtrl {
  constructor($translate, $uibModalInstance, CucControllerHelper, CucCloudMessage, serviceName,
    VpsService) {
    this.$translate = $translate;
    this.$uibModalInstance = $uibModalInstance;
    this.CucCloudMessage = CucCloudMessage;
    this.serviceName = serviceName;
    this.VpsService = VpsService;
    this.CucControllerHelper = CucControllerHelper;

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
        .catch(() => this.CucCloudMessage.error(this.$translate.instant('vps_configuration_reboot_fail')))
        .finally(() => { this.loader.init = false; });
    } else {
      this.CucCloudMessage.error(this.$translate.instant('vps_configuration_polling_fail'));
      this.loader.init = false;
    }
  }

  cancel() {
    this.$uibModalInstance.dismiss();
  }

  confirm() {
    this.save = this.CucControllerHelper.request.getHashLoader({
      loaderFunction: () => this.VpsService.reboot(this.serviceName, this.selected.rescue)
        .then(() => this.CucCloudMessage.success(this.$translate.instant('vps_configuration_reboot_success', { serviceName: this.serviceName })))
        .catch(() => this.CucCloudMessage.error(this.$translate.instant('vps_configuration_reboot_fail')))
        .finally(() => this.$uibModalInstance.close()),
    });
    return this.save.load();
  }
}

angular.module('managerApp').controller('VpsRebootCtrl', VpsRebootCtrl);
