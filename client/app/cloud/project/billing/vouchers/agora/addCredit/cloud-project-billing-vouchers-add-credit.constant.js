angular.module('managerApp')
  .constant('CLOUD_PROJECT_CREDIT_ORDER', {
    orderLimits: {
      min: 1,
      max: 20000000,
    },
    defaultAmount: 10,
  });
