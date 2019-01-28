angular.module('managerApp').config(($stateProvider) => {
  $stateProvider.state('iaas.pci-project.billing.vouchers.agora.operations', {
    url: '/:balanceName/operations',
    views: {
      'cloudProjectBillingVouchers@iaas.pci-project.billing.vouchers': {
        component: 'cloudProjectBillingVouchersOperationsAgora',
      },
    },
    translations: {
      value: ['.', './addCredit'],
      format: 'json',
    },
  });
});
