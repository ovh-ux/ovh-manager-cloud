angular.module('managerApp').config(($stateProvider) => {
  $stateProvider.state('iaas.pci-project.billing.vouchers.legacy', {
    url: '',
    views: {
      cloudProjectBillingVouchers: {
        templateUrl: 'app/cloud/project/billing/vouchers/legacy/cloud-project-billing-vouchers-legacy.html',
        controller: 'CloudprojectbillingvouchersCtrl',
        controllerAs: 'VouchersCtrl',
      },
    },
    translations: {
      value: ['.', './addCredit'],
      format: 'json',
    },
  });
});
