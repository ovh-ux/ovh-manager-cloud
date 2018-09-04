angular.module('managerApp').config(($stateProvider) => {
  $stateProvider.state('iaas.pci-project.compute.taskOnboarding', {
    url: '/onboarding',
    views: {
      cloudProjectCompute: {
        templateUrl: 'app/cloud/project/compute/tasks/onboarding/cloud-project-compute-tasks-onboarding.html',
        controller: 'CloudProjectComputeTasksOnboardingCtrl',
        controllerAs: '$ctrl',
      },
    },
    translations: ['..'],
  });
});
