class AddSecondaryDnsCtrl {
  constructor($translate, $uibModalInstance, ControllerHelper, CucCloudMessage, serviceName,
    VpsService) {
    this.$translate = $translate;
    this.$uibModalInstance = $uibModalInstance;
    this.serviceName = serviceName;
    this.CucCloudMessage = CucCloudMessage;
    this.VpsService = VpsService;
    this.ControllerHelper = ControllerHelper;
    this.available = null;
    this.model = null;
  }

  $onInit() {
    this.loadAvailableDns();
  }

  loadAvailableDns() {
    this.availableDns = this.ControllerHelper.request.getHashLoader({
      loaderFunction: () => this.VpsService.getSecondaryDNSAvailable(this.serviceName)
        .then((data) => { this.available = data; })
        .catch(() => this.CucCloudMessage.error(this.$translate.instant('vps_configuration_secondarydns_add_fail'))),
    });
    return this.availableDns.load();
  }

  cancel() {
    this.$uibModalInstance.dismiss();
  }

  confirm() {
    this.CucCloudMessage.flushChildMessage();
    this.addDns = this.ControllerHelper.request.getHashLoader({
      loaderFunction: () => this.VpsService.addSecondaryDnsDomain(this.serviceName, this.model)
        .then(() => this.CucCloudMessage.success(this.$translate.instant('vps_configuration_secondarydns_add_success', { domain: this.model })))
        .catch(err => this.CucCloudMessage.error(err.message))
        .finally(() => this.$uibModalInstance.close()),
    });
    return this.addDns.load();
  }
}

angular.module('managerApp').controller('AddSecondaryDnsCtrl', AddSecondaryDnsCtrl);
