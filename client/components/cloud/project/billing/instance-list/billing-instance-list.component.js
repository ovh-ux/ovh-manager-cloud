

angular.module('managerApp')
  .component('instanceList', {
    templateUrl: 'components/cloud/project/billing/instance-list/billing-instance-list.component.html',
    controller: 'BillingInstanceListComponentCtrl',
    bindings: {
      instances: '<',
      instanceColName: '<',
      instanceColTotal: '<',
      instanceColTotalTooltip: '<',
      showSwitchToMonthlyBillingOption: '<',
      showAdditionalInstanceDetails: '<',
    },
  });
