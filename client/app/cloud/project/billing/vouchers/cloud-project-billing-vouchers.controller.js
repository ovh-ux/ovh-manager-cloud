class CloudprojectbillingvouchersCtrl {
  constructor($q, $stateParams, $translate, CucCloudMessage, $uibModal, OvhApiMeBill,
    ControllerHelper, CloudVouchersService, ServiceHelper, OvhApiOrderCloudProjectCredit) {
    this.$q = $q;
    this.$stateParams = $stateParams;
    this.$translate = $translate;
    this.CucCloudMessage = CucCloudMessage;
    this.$uibModal = $uibModal;
    this.OvhApiMeBill = OvhApiMeBill;
    this.ControllerHelper = ControllerHelper;
    this.CloudVouchersService = CloudVouchersService;
    this.ServiceHelper = ServiceHelper;
    this.OvhApiOrderCloudProjectCredit = OvhApiOrderCloudProjectCredit;

    this.vouchers = this.ControllerHelper.request.getArrayLoader({
      loaderFunction: () => this.CloudVouchersService.getVouchers($stateParams.projectId),
      errorHandler: err => this.CucCloudMessage.error({
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
      templateUrl: 'app/cloud/project/billing/vouchers/addVoucher/cloud-project-billing-vouchers-add.html',
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
      templateUrl: 'app/cloud/project/billing/vouchers/addCredit/cloud-project-billing-vouchers-add-credit.html',
      controller: 'CloudProjectBillingVouchersAddcreditCtrl',
      controllerAs: 'CloudProjectBillingVouchersAddcreditCtrl',
    }).result.then((amount) => {
      this.ServiceHelper.loadOnNewPage(this.addCredit(amount), {
        successMessage: (data) => {
          this.CucCloudMessage.success({
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
