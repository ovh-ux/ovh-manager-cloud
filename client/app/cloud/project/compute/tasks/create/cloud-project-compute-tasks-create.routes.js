angular.module('managerApp').config(($stateProvider) => {
  $stateProvider.state('iaas.pci-project.compute.task.create', {
    url: '/create',
    views: {
      'cloudProjectCompute@iaas.pci-project.compute': {
        templateUrl: 'app/cloud/project/compute/tasks/create/cloud-project-compute-tasks-create.html',
        controller: 'CloudProjectComputeTasksCreateCtrl',
        controllerAs: '$ctrl',
      },
    },
    params: {
      instanceId: null,
    },
    translations: ['..'],
  });
});
