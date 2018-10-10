angular.module('managerApp').config(($stateProvider) => {
  $stateProvider.state('iaas.pci-project.compute.task.create', {
    url: '/create',
    views: {
      'cloudProjectCompute@iaas.pci-project.compute': {
        component: 'cpcTasksCreate',
      },
    },
    params: {
      instanceId: null,
    },
    translations: ['..'],
  });
});
