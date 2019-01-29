angular.module('managerApp').controller('CloudProjectBillingConsumptionCurrentCtrl',
  class {
    /* @ngInject */
    constructor($q, $translate, $stateParams, CucCloudMessage,
      CloudProjectBillingService, OvhApiCloudProjectUsageCurrent) {
      this.$q = $q;
      this.$translate = $translate;
      this.$stateParams = $stateParams;
      this.CucCloudMessage = CucCloudMessage;
      this.CloudProjectBillingService = CloudProjectBillingService;
      this.OvhApiCloudProjectUsageCurrent = OvhApiCloudProjectUsageCurrent;
    }

    $onInit() {
      this.loading = true;
      return this.OvhApiCloudProjectUsageCurrent.v6()
        .get({ serviceName: this.$stateParams.projectId }).$promise
        .then(billingInfo => this.CloudProjectBillingService.getConsumptionDetails(
          billingInfo,
          billingInfo,
        ))
        .then((data) => {
          this.data = data;
        })
        .catch((err) => {
          this.CucCloudMessage.error([this.$translate.instant('cpb_error_message'), (err.data && err.data.message) || ''].join(' '));
          return this.$q.reject(err);
        })
        .finally(() => {
          this.loading = false;
        });
    }
  });
