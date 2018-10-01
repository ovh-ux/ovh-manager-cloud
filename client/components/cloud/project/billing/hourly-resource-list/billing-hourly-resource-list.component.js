

angular.module('managerApp')
  .component('hourlyResourceList', {
    templateUrl: 'components/cloud/project/billing/hourly-resource-list/billing-hourly-resource-list.component.html',
    controller: 'BillingHourlyResourceListComponentCtrl',
    bindings: {
      resources: '<',
      showSwitchToMonthlyBillingOption: '<',
      showAdditionalInstanceDetails: '<',
    },
  });
