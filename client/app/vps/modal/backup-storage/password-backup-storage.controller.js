class PasswordBackupStorageCtrl {
  constructor($translate, $uibModalInstance, ControllerHelper, CloudMessage, serviceName,
    VpsService) {
    this.$translate = $translate;
    this.$uibModalInstance = $uibModalInstance;
    this.serviceName = serviceName;
    this.CloudMessage = CloudMessage;
    this.VpsService = VpsService;
    this.ControllerHelper = ControllerHelper;
  }

  cancel() {
    this.$uibModalInstance.dismiss();
  }

  confirm() {
    this.CloudMessage.flushChildMessage();
    this.loader = this.ControllerHelper.request.getHashLoader({
      loaderFunction: () => this.VpsService.requestFtpBackupPassword(this.serviceName)
        .then(() => this.CloudMessage.success(this.$translate.instant('vps_backup_storage_access_forgot_password_success')))
        .catch(() => this.CloudMessage.error(this.$translate.instant('vps_backup_storage_access_forgot_password_failure')))
        .finally(() => this.$uibModalInstance.close()),
    });
    return this.loader.load();
  }
}

angular.module('managerApp').controller('PasswordBackupStorageCtrl', PasswordBackupStorageCtrl);
