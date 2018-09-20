class InfoModalController {
  constructor($translate, $uibModalInstance, params) {
    this.$translate = $translate;
    this.$uibModalInstance = $uibModalInstance;
    this.params = params;
  }

  $onInit() {
    this.okButtonText = this.params.okButtonText || this.$translate.instant('common_modal_ok');
    this.cancelButtonText = this.params.cancelButtonText || this.$translate.instant('common_cancel');
  }

  dismissModal() {
    this.$uibModalInstance.dismiss();
  }

  closeModal() {
    this.$uibModalInstance.close();
  }
}

angular.module('managerApp').controller('InfoModalController', InfoModalController);
