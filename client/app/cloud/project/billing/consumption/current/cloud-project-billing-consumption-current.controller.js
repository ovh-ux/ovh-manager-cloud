angular.module('managerApp').controller('CloudProjectBillingConsumptionCurrentCtrl',
  class {
    /* @ngInject */
    constructor(
      $q,
      $stateParams,
      $translate,
      CucCloudMessage,
      CloudProjectBillingLegacyService,
      CloudProjectBillingService,
      me,
      OvhApiCloudProjectUsageCurrent,
    ) {
      this.$q = $q;
      this.$stateParams = $stateParams;
      this.$translate = $translate;
      this.CucCloudMessage = CucCloudMessage;
      this.CloudProjectBillingLegacyService = CloudProjectBillingLegacyService;
      this.CloudProjectBillingService = CloudProjectBillingService;
      this.me = me;
      this.OvhApiCloudProjectUsageCurrent = OvhApiCloudProjectUsageCurrent;
    }

    $onInit() {
      this.serviceName = this.$stateParams.projectId;
      this.loading = true;
      return this.CloudProjectBillingService.getIfProjectUsesAgora(this.serviceName)
        .then(projectUsesAgora => (projectUsesAgora
          ? this.getAgoraConsumption()
          : this.getLegacyConsumption()))
        .then((consumption) => {
          this.data = consumption;
        })
        .catch((err) => {
          console.log(err);
          this.CucCloudMessage.error([this.$translate.instant('cpb_error_message'), (err.data && err.data.message) || ''].join(' '));
          return this.$q.reject(err);
        })
        .finally(() => {
          this.loading = false;
        });
    }

    getLegacyConsumption() {
      return this.OvhApiCloudProjectUsageCurrent.v6()
        .get({ serviceName: this.$stateParams.projectId }).$promise
        .then(billingInfo => this.CloudProjectBillingLegacyService.getConsumptionDetails(
          billingInfo,
          billingInfo,
        ))
        .then((consumption) => {
          this.consumption = {
            hourly: this.CloudProjectBillingLegacyService
              .formatLegacyHourlyConsumption(consumption),
          };
          return consumption;
        });
    }

    getAgoraConsumption() {
      return this.CloudProjectBillingService.getProjectServiceInfos(this.serviceName)
        .then(({ serviceId }) => this.CloudProjectBillingService
          .getCurrentConsumption(serviceId))
        .then((serviceConsumption) => {
          const { instance, volume } = this.CloudProjectBillingService.constructor
            .groupConsumptionByFamily(serviceConsumption.elements);
          this.consumption = {
            hourly: {
              instance: this.CloudProjectBillingService
                .formatHourlyConsumption(
                  instance,
                  this.me.currency.symbol,
                ),
              volume: this.CloudProjectBillingService
                .formatHourlyConsumption(
                  volume,
                  this.me.currency.symbol,
                ),
              price: serviceConsumption.price,
            },
          };

          return serviceConsumption;
        });
    }
  });
