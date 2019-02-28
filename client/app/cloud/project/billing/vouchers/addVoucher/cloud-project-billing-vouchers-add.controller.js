class CloudProjectBillingVoucherAddCtrl {
  constructor($translate, $uibModalInstance, atInternet, CucControllerHelper, CucCloudMessage,
    OvhApiCloudProjectCredit, serviceName, TRACKING_CLOUD) {
    this.$translate = $translate;
    this.$uibModalInstance = $uibModalInstance;
    this.atInternet = atInternet;
    this.CucControllerHelper = CucControllerHelper;
    this.CucCloudMessage = CucCloudMessage;
    this.OvhApiCloudProjectCredit = OvhApiCloudProjectCredit;
    this.serviceName = serviceName;
    this.TRACKING_CLOUD = TRACKING_CLOUD;

    this.model = {
      value: undefined,
    };
  }

  cancel() {
    this.$uibModalInstance.dismiss();
  }

  confirm() {
    this.CucCloudMessage.flushChildMessage();
    this.atInternet.trackClick({
      name: this.TRACKING_CLOUD.billing_rights_activate_voucher,
      type: 'action',
    });
    this.saving = this.CucControllerHelper.request.getHashLoader({
      loaderFunction: () => this.OvhApiCloudProjectCredit.v6().save({
        serviceName: this.serviceName,
      }, {
        code: this.model.value,
      }).$promise
        .then(() => this.CucCloudMessage.success(this.$translate.instant('cpb_vouchers_add_success')))
        .catch(err => this.CucCloudMessage.error(this.$translate.instant('cpb_vouchers_add_error') + (err.data && err.data.message ? ` (${err.data.message})` : '')))
        .finally(() => {
          this.$uibModalInstance.close();
        }),
    });
    return this.saving.load();
  }
}

angular.module('managerApp').controller('CloudProjectBillingVoucherAddCtrl', CloudProjectBillingVoucherAddCtrl);
