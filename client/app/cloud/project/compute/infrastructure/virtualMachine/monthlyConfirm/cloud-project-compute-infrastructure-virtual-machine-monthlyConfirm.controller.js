

angular.module('managerApp').controller('CloudProjectComputeInfrastructureVirtualmachineMonthlyConfirm', function CloudProjectComputeInfrastructureVirtualmachineMonthlyConfirm($uibModalInstance, params, $translate, CloudMessage, CloudProjectComputeInfrastructureOrchestrator) {
  const self = this;

  self.vmInEdition = params;

  self.loaders = {
    saveVm: false,
  };

  this.cancel = function cancel() {
    $uibModalInstance.dismiss();
  };

  this.confirm = function confirm() {
    self.vmInEdition.initEdition();
    self.vmInEdition.monthlyBillingBoolean = true;
    self.loaders.saveVm = true;
    CloudProjectComputeInfrastructureOrchestrator.saveEditedVm(self.vmInEdition).then(() => {
      CloudMessage.success($translate.instant('cpcivm_monthly_success'));
    }, (err) => {
      CloudMessage.error([
        $translate.instant('cpcivm_monthly_fail'),
        (err.data && err.data.message) || '',
      ].join(' '));
    }).finally(() => {
      self.loaders.saveVm = false;
      $uibModalInstance.dismiss();
    });
  };
});
