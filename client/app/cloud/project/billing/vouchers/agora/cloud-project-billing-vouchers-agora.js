angular.module('managerApp').config(($stateProvider) => {
  $stateProvider.state('iaas.pci-project.billing.vouchers.agora', {
    url: '',
    views: {
      cloudProjectBillingVouchers: {
        templateUrl: 'app/cloud/project/billing/vouchers/agora/cloud-project-billing-vouchers-agora.html',
        controller: 'CloudProjectBillingVouchersCtrl',
        controllerAs: '$ctrl',
      },
    },
    translations: {
      value: ['.', './addCredit'],
      format: 'json',
    },
  });
});
