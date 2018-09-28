class VpsDeleteSnapshotCtrl {
  constructor($translate, $uibModalInstance, ControllerHelper, CloudMessage, serviceName,
    VpsService) {
    this.$translate = $translate;
    this.$uibModalInstance = $uibModalInstance;
    this.CloudMessage = CloudMessage;
    this.serviceName = serviceName;
    this.VpsService = VpsService;
    this.ControllerHelper = ControllerHelper;
  }

  cancel() {
    this.$uibModalInstance.dismiss();
  }

  confirm() {
    this.delete = this.ControllerHelper.request.getHashLoader({
      loaderFunction: () => this.VpsService.deleteSnapshot(this.serviceName)
        .then(() => this.CloudMessage.success(this.$translate.instant('vps_configuration_delete_snapshot_success', { serviceName: this.serviceName })))
        .catch(error => this.CloudMessage.error(error.message || this.$translate.instant('vps_configuration_delete_snapshot_fail')))
        .finally(() => this.$uibModalInstance.close()),
    });
    return this.delete.load();
  }
}

angular.module('managerApp').controller('VpsDeleteSnapshotCtrl', VpsDeleteSnapshotCtrl);
