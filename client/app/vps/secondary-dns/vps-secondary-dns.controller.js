class VpsSecondaryDnsCtrl {
  constructor($stateParams, CloudMessage, VpsActionService, VpsService) {
    this.serviceName = $stateParams.serviceName;
    this.CloudMessage = CloudMessage;
    this.VpsActionService = VpsActionService;
    this.VpsService = VpsService;

    this.loaders = {
      init: true,
    };
    this.secondaryDns = [undefined];
  }

  $onInit() {
    this.refreshSecondaryDnsList();
  }

  refreshSecondaryDnsList() {
    this.loaders.init = true;
    this.loadSecondaryDns()
      .finally(() => { this.loaders.init = false; });
  }

  loadSecondaryDns() {
    return this.VpsService.getTabSecondaryDns(this.serviceName)
      .then((data) => {
        this.secondaryDns = data;
        return data.list.results;
      })
      .catch(err => this.CloudMessage.error(err));
  }

  add() {
    this.VpsActionService.addSecondaryDns(this.serviceName)
      .finally(() => this.refreshSecondaryDnsList());
  }

  deleteOne(domain) {
    this.VpsActionService.deleteSecondaryDns(this.serviceName, domain)
      .finally(() => this.refreshSecondaryDnsList());
  }
}

angular.module('managerApp').controller('VpsSecondaryDnsCtrl', VpsSecondaryDnsCtrl);
