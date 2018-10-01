class VpsKvmCtrl {
  constructor($sce, $translate, $uibModalInstance, ControllerHelper, CloudMessage, noVNC,
    serviceName, VpsService) {
    this.$sce = $sce;
    this.$translate = $translate;
    this.$uibModalInstance = $uibModalInstance;
    this.CloudMessage = CloudMessage;
    this.noVNC = noVNC;
    this.serviceName = serviceName;
    this.VpsService = VpsService;
    this.ControllerHelper = ControllerHelper;

    this.consoleUrl = null;
    this.kvm = {};
  }

  $onInit() {
    if (this.noVNC) {
      this.loadKvm();
    } else {
      this.kvmUrl();
    }
  }

  kvmUrl() {
    this.kvmUrlLoader = this.ControllerHelper.request.getHashLoader({
      loaderFunction: () => this.VpsService.getKVMConsoleUrl(this.serviceName)
        .then((data) => {
          this.consoleUrl = this.$sce.trustAsResourceUrl(data);
        })
        .catch(() => this.CloudMessage.error(this.$translate.instant('vps_configuration_kvm_fail'))),
    });
    return this.kvmUrlLoader.load();
  }

  loadKvm() {
    this.kvmLoader = this.ControllerHelper.request.getHashLoader({
      loaderFunction: () => this.VpsService.getKVMAccess(this.serviceName)
        .then((data) => { this.kvm = data; })
        .catch(() => this.CloudMessage.error(this.$translate.instant('vps_configuration_kvm_fail'))),
    });
    return this.kvmLoader.load();
  }

  close() {
    this.$uibModalInstance.dismiss();
  }
}

angular.module('managerApp').controller('VpsKvmCtrl', VpsKvmCtrl);
