angular.module('managerApp').config(($stateProvider) => {
  $stateProvider
    .state('onboarding.pci', {
      url: '/pci',
      views: {
        onboardingContent: {
          templateUrl: 'app/onboarding/pci/pci.html',
          controller: 'pciSlideshowCtrl',
          controllerAs: 'Ctrl',
        },
      },
    });
});
