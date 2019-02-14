

angular.module('managerApp').config(($stateProvider) => {
  $stateProvider.state('iaas.pci-project.billing.consumption.estimate', {
    url: '/estimate',
    views: {
      cloudProjectBillingConsumption: 'cloudProjectBillingConsumptionEstimate',
    },
    translations: {
      value: ['.', './alert/add'],
      format: 'json',
    },
  });
});
