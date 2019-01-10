angular.module('managerApp').config(($stateProvider) => {
  $stateProvider
    .state('onboarding.pci', {
      url: '/pci?serviceName',
      views: {
        onboardingContent: {
          controller: 'pciSlideshowModalCtrl',
        },
      },
    });
});
