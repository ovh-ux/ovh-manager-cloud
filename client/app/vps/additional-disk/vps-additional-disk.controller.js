class VpsAdditionalDiskCtrl {
  constructor($q, $stateParams, $translate, CucCloudMessage, VpsActionService, VpsService) {
    this.$q = $q;
    this.serviceName = $stateParams.serviceName;
    this.$translate = $translate;
    this.CucCloudMessage = CucCloudMessage;
    this.VpsActionService = VpsActionService;
    this.VpsService = VpsService;

    this.loaders = {
      init: false,
      disk: false,
    };
    this.additionnalDisks = [];
    this.hasAdditionalDiskOption = null;
  }

  $onInit() {
    this.hasAdditionalDisk();
  }

  hasAdditionalDisk() {
    this.loaders.init = true;
    this.VpsService.hasAdditionalDiskOption(this.serviceName)
      .then(() => {
        this.hasAdditionalDiskOption = true;
        if (this.hasAdditionalDiskOption) {
          this.loadAdditionalDisks();
        }
      })
      .catch(() => { this.hasAdditionalDiskOption = false; })
      .finally(() => { this.loaders.init = false; });
  }

  loadAdditionalDisks() {
    this.loaders.disk = true;
    this.VpsService.getDisks(this.serviceName)
      .then((data) => {
        const promises = _.map(data, elem => this.VpsService.getDiskInfo(this.serviceName, elem));
        return this.$q.all(promises)
          .then((diskInfos) => {
            this.additionnalDisks = this.VpsService.showOnlyAdditionalDisk(diskInfos);
          });
      })
      .catch((error) => {
        this.CucCloudMessage.error(this.$translate.instant('vps_additional_disk_info_fail'));
        return this.$q.reject(error);
      })
      .finally(() => { this.loaders.disk = false; });
  }

  canOrder() {
    return _.isEmpty(this.additionnalDisks);
  }
}

angular.module('managerApp').controller('VpsAdditionalDiskCtrl', VpsAdditionalDiskCtrl);
