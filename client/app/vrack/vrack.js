

angular.module('managerApp').config(($stateProvider) => {
  $stateProvider
    .state('vrack', {
      url: '/vrack/:vrackId',
      templateUrl: 'app/vrack/vrack.html',
      controller: 'VrackCtrl',
      controllerAs: 'VrackCtrl',
      translations: ['../common', '.'],
    })
    .state('vrack-home', {
      url: '/vrack',
      templateUrl: 'app/vrack/vrack.html',
      controller: 'VrackCtrl',
      controllerAs: 'VrackCtrl',
      translations: ['../common', '.'],
    });
});
