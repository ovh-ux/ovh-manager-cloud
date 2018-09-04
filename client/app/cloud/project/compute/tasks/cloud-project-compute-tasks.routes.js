angular.module('managerApp').config(($stateProvider) => {
  $stateProvider.state('iaas.pci-project.compute.task', {
    url: '/task',
    views: {
      cloudProjectCompute: {
        templateUrl: 'app/cloud/project/compute/tasks/cloud-project-compute-tasks.html',
        controller: 'CloudProjectComputeTasksCtrl',
        controllerAs: '$ctrl',
      },
    },
    translations: ['.'],
  });
});
