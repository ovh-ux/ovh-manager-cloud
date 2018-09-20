class ConfirmationModalController {
  constructor($translate, $uibModalInstance, params) {
    this.$uibModalInstance = $uibModalInstance;
    this.params = params;

    this.submitButtonText = this.params.submitButtonText ? this.params.submitButtonText : $translate.instant('common_modal_ok');
    this.cancelButtonText = this.params.cancelButtonText ? this.params.cancelButtonText : $translate.instant('common_cancel');
  }

  dismissModal() {
    this.$uibModalInstance.dismiss('cancel');
  }

  closeModal() {
    this.$uibModalInstance.close();
  }
}

angular.module('managerApp').controller('ConfirmationModalController', ConfirmationModalController);
