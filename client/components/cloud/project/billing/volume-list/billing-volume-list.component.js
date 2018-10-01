

angular.module('managerApp')
  .component('volumeList', {
    templateUrl: 'components/cloud/project/billing/volume-list/billing-volume-list.component.html',
    controller: 'BillingVolumeListComponentCtrl',
    bindings: {
      volumes: '<',
    },
  });
