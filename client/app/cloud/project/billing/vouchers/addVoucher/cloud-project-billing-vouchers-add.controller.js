class CloudProjectBillingVoucherAddCtrl {
  /* @ngInject */
  constructor(
    $translate,
    $uibModalInstance,
    ControllerHelper,
    CloudMessage,
    CloudVouchersAgoraService,
    isProjectUsingAgora,
    OvhApiCloudProjectCredit,
    serviceName,
  ) {
    this.$translate = $translate;
    this.$uibModalInstance = $uibModalInstance;
    this.ControllerHelper = ControllerHelper;
    this.CloudMessage = CloudMessage;
    this.CloudVouchersAgoraService = CloudVouchersAgoraService;
    this.isProjectUsingAgora = isProjectUsingAgora;
    this.OvhApiCloudProjectCredit = OvhApiCloudProjectCredit;
    this.serviceName = serviceName;

    this.model = {
      value: undefined,
    };
  }

  cancel() {
    this.$uibModalInstance.dismiss();
  }

  confirm() {
    this.CloudMessage.flushChildMessage();
    this.addingCredit = this.ControllerHelper.request.getHashLoader({
      loaderFunction: () => (this.isProjectUsingAgora
        ? this.CloudVouchersAgoraService.activateCreditCode(this.model.value)
        : this.OvhApiCloudProjectCredit.v6().save({
          serviceName: this.serviceName,
        }, {
          code: this.model.value,
        }).$promise)
        .then(() => this.CloudMessage.success(this.$translate.instant('cpb_vouchers_add_success')))
        .catch(err => this.CloudMessage.error(this.$translate.instant('cpb_vouchers_add_error') + (err.data && err.data.message ? ` (${err.data.message})` : '')))
        .finally(() => {
          this.$uibModalInstance.close();
        }),
    });
    return this.addingCredit.load();
  }
}

angular.module('managerApp').controller('CloudProjectBillingVoucherAddCtrl', CloudProjectBillingVoucherAddCtrl);
