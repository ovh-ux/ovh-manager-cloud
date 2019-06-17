

angular.module('managerApp')
  .component('iaasPciProjectNew', {
    templateUrl: 'app/cloud/project/add/cloud-project-add.html',
    controller: 'CloudProjectAddCtrl',
  })
  .config(/* @ngInject */ ($stateProvider) => {
    $stateProvider
      .state('iaas.pci-project-new', {
        url: '/pci/project/new',
        component: 'iaasPciProjectNew',
        translations: {
          value: ['.'],
          format: 'json',
        },
      });
  });
