

angular.module('managerApp')
  .config(($stateProvider) => {
    $stateProvider
      .state('paas.nasha-add', {
        url: '/nasha/new',
        templateUrl: 'app/nasha/add/nasha-add.html',
        controller: 'NashaAddCtrl',
        controllerAs: 'NashaAddCtrl',
        translations: ['common', 'nasha', 'nasha/add'],
      })
      .state('paas.nasha-unavailable', {
        url: '/nasha/unavailable',
        templateUrl: 'app/nasha/add/nasha-unavailable.html',
        controller: 'NashaUnavailableCtrl',
        controllerAs: '$ctrl',
        translations: ['common', 'nasha', 'nasha/add'],
      });
  });
