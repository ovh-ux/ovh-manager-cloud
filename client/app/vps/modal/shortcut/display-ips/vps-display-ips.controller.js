class VpsDisplayIpsCtrl {
  constructor($translate, $uibModalInstance, ControllerHelper, CucCloudMessage, serviceName,
    VpsService) {
    this.$translate = $translate;
    this.$uibModalInstance = $uibModalInstance;
    this.CucCloudMessage = CucCloudMessage;
    this.serviceName = serviceName;
    this.VpsService = VpsService;
    this.ControllerHelper = ControllerHelper;
    this.ips = [];
  }

  $onInit() {
    this.ipsLoader = this.ControllerHelper.request.getHashLoader({
      loaderFunction: () => this.VpsService.getIps(this.serviceName)
        .then((data) => { this.ips = data.results; })
        .catch(() => this.CucCloudMessage.error(this.$translate.instant('vps_configuration_reversedns_fail'))),
    });
    return this.ipsLoader.load();
  }

  cancel() {
    this.$uibModalInstance.dismiss();
  }
}

angular.module('managerApp').controller('VpsDisplayIpsCtrl', VpsDisplayIpsCtrl);
