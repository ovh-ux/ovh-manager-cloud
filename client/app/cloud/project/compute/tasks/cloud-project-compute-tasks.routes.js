angular.module('managerApp').config(($stateProvider) => {
  $stateProvider.state('iaas.pci-project.compute.task', {
    url: '/task',
    views: {
      cloudProjectCompute: {
        component: 'cpcTasks',
      },
    },
    translations: ['.'],
  });
});
