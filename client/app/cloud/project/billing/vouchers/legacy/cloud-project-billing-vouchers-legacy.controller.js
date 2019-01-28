class CloudprojectbillingvouchersCtrl {
  constructor(
    $q,
    $stateParams,
    $translate,
    $uibModal,
    CloudMessage,
    ControllerHelper,
    OvhApiOrderCloudProjectCredit,
    ServiceHelper,
  ) {
    this.$q = $q;
    this.$stateParams = $stateParams;
    this.$translate = $translate;
    this.CloudMessage = CloudMessage;
    this.$uibModal = $uibModal;
    this.CloudMessage = CloudMessage;
    this.ControllerHelper = ControllerHelper;
    this.CloudVouchersService = CloudVouchersService;
    this.OvhApiOrderCloudProjectCredit = OvhApiOrderCloudProjectCredit;
    this.ServiceHelper = ServiceHelper;
    this.OvhApiOrderCloudProjectCredit = OvhApiOrderCloudProjectCredit;

    this.vouchers = this.ControllerHelper.request.getArrayLoader({
      loaderFunction: () => this.CloudVouchersService.getVouchers($stateParams.projectId),
      errorHandler: err => this.CloudMessage.error({
        text: `${this.$translate.instant('cpb_vouchers_get_error')} ${err.data}`,
      }),
    });
  }

  $onInit() {
    this.vouchers.load();
  }

  openAddVoucher() {
    this.$uibModal.open({
      windowTopClass: 'cui-modal',
      templateUrl: 'app/cloud/project/billing/vouchers/legacy/addVoucher/cloud-project-billing-vouchers-add.html',
      controller: 'CloudProjectBillingVoucherAddCtrl',
      controllerAs: '$ctrl',
      resolve: {
        serviceName: () => this.$stateParams.projectId,
      },
    }).result.then(() => this.$onInit());
  }

  openAddCredit() {
    this.$uibModal.open({
      windowTopClass: 'cui-modal',
      templateUrl: 'app/cloud/project/billing/vouchers/legacy/addCredit/cloud-project-billing-vouchers-add-credit.html',
      controller: 'CloudProjectBillingVouchersAddcreditCtrl',
      controllerAs: 'CloudProjectBillingVouchersAddcreditCtrl',
    }).result.then((amount) => {
      this.ServiceHelper.loadOnNewPage(this.addCredit(amount), {
        successMessage: (data) => {
          this.CloudMessage.success({
            textHtml: this.$translate.instant('cpb_vouchers_add_credit_success', {
              url: data.orderUrl,
              amount,
            }),
          });
        },
      });
    });
  }

  addCredit(amount) {
    return this.OvhApiOrderCloudProjectCredit.v6().save({
      serviceName: this.$stateParams.projectId,
    }, {
      amount,
    }).$promise;
  }
}

angular.module('managerApp').controller('CloudprojectbillingvouchersCtrl', CloudprojectbillingvouchersCtrl);
