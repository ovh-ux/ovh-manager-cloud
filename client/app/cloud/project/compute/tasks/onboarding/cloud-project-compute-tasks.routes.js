angular.module('managerApp').config(($stateProvider) => {
  $stateProvider.state('iaas.pci-project.compute.taskOnboarding', {
    url: '/onboarding',
    views: {
      cloudProjectCompute: {
        component: 'cpcTasksOnboarding',
      },
    },
    translations: ['..'],
  });
});
