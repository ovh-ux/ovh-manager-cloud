class PasswordBackupStorageCtrl {
  constructor($translate, $uibModalInstance, ControllerHelper, CucCloudMessage, serviceName,
    VpsService) {
    this.$translate = $translate;
    this.$uibModalInstance = $uibModalInstance;
    this.serviceName = serviceName;
    this.CucCloudMessage = CucCloudMessage;
    this.VpsService = VpsService;
    this.ControllerHelper = ControllerHelper;
  }

  cancel() {
    this.$uibModalInstance.dismiss();
  }

  confirm() {
    this.CucCloudMessage.flushChildMessage();
    this.loader = this.ControllerHelper.request.getHashLoader({
      loaderFunction: () => this.VpsService.requestFtpBackupPassword(this.serviceName)
        .then(() => this.CucCloudMessage.success(this.$translate.instant('vps_backup_storage_access_forgot_password_success')))
        .catch(() => this.CucCloudMessage.error(this.$translate.instant('vps_backup_storage_access_forgot_password_failure')))
        .finally(() => this.$uibModalInstance.close()),
    });
    return this.loader.load();
  }
}

angular.module('managerApp').controller('PasswordBackupStorageCtrl', PasswordBackupStorageCtrl);
