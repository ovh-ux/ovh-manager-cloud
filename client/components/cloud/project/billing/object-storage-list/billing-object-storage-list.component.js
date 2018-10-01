

angular.module('managerApp')
  .component('objectStorageList', {
    templateUrl: 'components/cloud/project/billing/object-storage-list/billing-object-storage-list.component.html',
    controller: 'BillingObjectStorageListComponentCtrl',
    bindings: {
      storages: '<',
    },
  });
