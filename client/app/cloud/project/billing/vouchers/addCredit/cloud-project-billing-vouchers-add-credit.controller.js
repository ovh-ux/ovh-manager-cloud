class CloudProjectBillingVouchersAddcreditCtrl {
  constructor($uibModalInstance, atInternet, CucControllerHelper, OvhApiMe) {
    this.$uibModalInstance = $uibModalInstance;
    this.atInternet = atInternet;
    this.CucControllerHelper = CucControllerHelper;
    this.OvhApiMe = OvhApiMe;
    this.credit = {
      amount: 10,
    };

    this.currency = this.CucControllerHelper.request.getHashLoader({
      loaderFunction: () => this.OvhApiMe.v6().get().$promise,
    });
  }

  $onInit() {
    this.currency.load();
  }

  addCredit() {
    this.atInternet.trackClick({
      name: 'bc_credit_cloud',
      type: 'action',
    });
    this.$uibModalInstance.close(this.credit.amount);
  }

  cancel() {
    this.$uibModalInstance.dismiss();
  }
}

angular.module('managerApp').controller('CloudProjectBillingVouchersAddcreditCtrl', CloudProjectBillingVouchersAddcreditCtrl);
