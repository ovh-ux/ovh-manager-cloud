angular.module('managerApp').config(($stateProvider) => {
  $stateProvider
    .state('onboarding', {
      url: '/onboarding',
      templateUrl: 'app/onboarding/onboarding.html',
      abstract: true,
      translations: {
        value: ['.'],
        format: 'json',
      },
    });
});
