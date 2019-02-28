class CloudProjectBillingVouchersAddcreditCtrl {
  constructor($uibModalInstance, atInternet, CucControllerHelper, OvhApiMe, TRACKING_CLOUD) {
    this.$uibModalInstance = $uibModalInstance;
    this.atInternet = atInternet;
    this.CucControllerHelper = CucControllerHelper;
    this.OvhApiMe = OvhApiMe;
    this.TRACKING_CLOUD = TRACKING_CLOUD;

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
      name: this.TRACKING_CLOUD.billing_rights_add_credit,
      type: 'action',
    });
    this.$uibModalInstance.close(this.credit.amount);
  }

  cancel() {
    this.$uibModalInstance.dismiss();
  }
}

angular.module('managerApp').controller('CloudProjectBillingVouchersAddcreditCtrl', CloudProjectBillingVouchersAddcreditCtrl);
