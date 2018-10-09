

angular.module('managerApp')
  .controller('CloudprojectcomputeinfrastructurevirtualmachinedeleteCtrl', function CloudprojectcomputeinfrastructurevirtualmachinedeleteCtrl(
    $uibModalInstance, params,
  ) {
    const self = this;
    const vmToDelete = params;

    self.loaders = {
      ips: false,
    };

    self.routedIpsFo = [];

    self.isMonthlyBilling = false;

    self.backup = function backup() {
      $uibModalInstance.close();
    };

    self.cancel = function cancel() {
      $uibModalInstance.dismiss();
    };

    function init() {
      self.isMonthlyBilling = vmToDelete.monthlyBilling && vmToDelete.monthlyBilling.status === 'ok';
    }


    init();
  });
