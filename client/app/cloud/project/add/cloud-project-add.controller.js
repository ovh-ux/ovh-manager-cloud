angular.module('managerApp').controller(
  'CloudProjectAddCtrl',
  class CloudProjectAddCtrl {
    /* @ngInject */
    constructor(OvhApiMe, URLS) {
      this.OvhApiMe = OvhApiMe;
      this.URLS = URLS;
    }

    $onInit() {
      this.orderLink = null;
      this.OvhApiMe
        .v6()
        .get()
        .$promise
        .then(({ ovhSubsidiary }) => {
          this.orderLink = this.URLS.manager_order.public_cloud_project[ovhSubsidiary];
        });
    }
  },
);
