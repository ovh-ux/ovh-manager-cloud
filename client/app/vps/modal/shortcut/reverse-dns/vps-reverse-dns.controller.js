class VpsReverseDnsCtrl {
  constructor($translate, $uibModalInstance, CucCloudMessage, serviceName, VpsService) {
    this.$translate = $translate;
    this.$uibModalInstance = $uibModalInstance;
    this.CucCloudMessage = CucCloudMessage;
    this.serviceName = serviceName;
    this.VpsService = VpsService;

    this.loader = {
      init: false,
      save: false,
    };

    this.ips = [];
    this.structuredData = {
      results: [],
    };
    this.model = {
      value: null,
      reverse: null,
    };
  }

  $onInit() {
    this.loader.init = true;
    this.VpsService.getIps(this.serviceName)
      .then((data) => { this.ips = data.results; })
      .catch(() => this.CucCloudMessage.error(this.$translate.instant('vps_configuration_reversedns_fail')))
      .finally(() => { this.loader.init = false; });
  }

  prepareDnsIpsStruct() {
    this.structuredData.results.push(angular.copy(this.model.value));
    this.structuredData.results[0].reverse = this.model.reverse;
  }

  cancel() {
    this.$uibModalInstance.dismiss();
  }

  confirm() {
    this.loader.save = true;
    this.prepareDnsIpsStruct();
    this.VpsService.setReversesDns(this.serviceName, this.structuredData)
      .then((data) => {
        if (data && data.state) {
          const messages = !_.isEmpty(data.messages) ? data.messages : [];
          switch (data.state) {
            case 'ERROR':
              this.CucCloudMessage.error(this.$translate.instant('vps_configuration_reversedns_fail'));
              messages.forEach(message => this.CucCloudMessage.error(message.message || message));
              break;
            case 'PARTIAL':
              break;
            case 'OK':
              this.CucCloudMessage.success(this.$translate.instant('vps_configuration_reversedns_success', { serviceName: this.serviceName }));
              break;
            default: this.this.CucCloudMessage.error(this.$translate.instant('vps_configuration_reversedns_fail'));
          }
        }
      })
      .catch(() => this.CucCloudMessage.error(this.$translate.instant('vps_configuration_reversedns_fail')))
      .finally(() => {
        this.loader.save = false;
        this.$uibModalInstance.close();
      });
  }
}

angular.module('managerApp').controller('VpsReverseDnsCtrl', VpsReverseDnsCtrl);
