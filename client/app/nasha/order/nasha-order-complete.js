

angular.module('managerApp')
  .config(($stateProvider) => {
    $stateProvider
      .state('paas.nasha-order-complete', {
        url: '/nasha/order/complete',
        templateUrl: 'app/nasha/order/nasha-order-complete.html',
        controller: 'NashaOrderCompleteCtrl',
        controllerAs: 'NashaOrderCompleteCtrl',
        translations: ['common', 'nasha', 'nasha/order'],
        params: {
          orderUrl: null,
        },
      });
  });
