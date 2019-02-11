angular.module('managerApp').controller('CloudProjectBillingConsumptionCurrentCtrl',
  class {
    /* @ngInject */
    constructor(
      $q,
      $stateParams,
      $translate,
      CucCloudMessage,
      CloudProjectBillingAgoraService,
      CloudProjectBillingService,
      isProjectUsingAgora,
      me,
      OvhApiCloudProjectUsageCurrent,
    ) {
      this.$q = $q;
      this.$stateParams = $stateParams;
      this.$translate = $translate;
      this.CucCloudMessage = CucCloudMessage;
      this.CloudProjectBillingAgoraService = CloudProjectBillingAgoraService;
      this.CloudProjectBillingService = CloudProjectBillingService;
      this.isProjectUsingAgora = isProjectUsingAgora;
      this.me = me;
      this.OvhApiCloudProjectUsageCurrent = OvhApiCloudProjectUsageCurrent;
    }

    $onInit() {
      this.serviceName = this.$stateParams.projectId;
      this.loading = true;
      return (this.isProjectUsingAgora ? this.getAgoraConsumption() : this.getLegacyConsumption())
        .then((consumption) => {
          this.data = consumption;
        })
        .catch((err) => {
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
        .then(billingInfo => this.CloudProjectBillingService.getConsumptionDetails(
          billingInfo,
          billingInfo,
        ))
        .then((consumption) => {
          this.consumption = {
            hourly: this.CloudProjectBillingService.formatLegacyHourlyConsumption(consumption),
          };
          return consumption;
        });
    }

    getAgoraConsumption() {
      return this.CloudProjectBillingAgoraService.getProjectServiceInfos(this.serviceName)
        .then(({ serviceId }) => this.$q.all({
          catalog: this.CloudProjectBillingAgoraService.getCloudCatalog(this.me.ovhSubsidiary),
          serviceConsumption: this.CloudProjectBillingAgoraService
            .getCurrentConsumption(serviceId),
        }))
        .then(({ catalog, serviceConsumption }) => {
          const {
            instance, snapshot, storage, volume,
          } = this.CloudProjectBillingAgoraService.constructor
            .groupConsumptionByFamily(_.get(serviceConsumption, 'elements', []), catalog.plans);

          this.consumption = {
            hourly: {
              instance: this.CloudProjectBillingAgoraService
                .formatInstanceHourlyConsumption(
                  instance,
                  this.me.currency.symbol,
                ),
              volume: this.CloudProjectBillingAgoraService
                .formatInstanceHourlyConsumption(
                  volume,
                  this.me.currency.symbol,
                ),
              snapshot: this.CloudProjectBillingAgoraService
                .formatInstanceHourlyConsumption(
                  snapshot,
                  this.me.currency.symbol,
                ),
              objectStorage: storage ? this.CloudProjectBillingAgoraService
                .formatStorageConsumption(
                  storage.filter(({ planCode }) => planCode.includes('storage')),
                  this.me.currency.symbol,
                ) : this.CloudProjectBillingAgoraService.constructor
                .formatEmptyConsumption(this.me.currency.symbol),
              price: _.get(
                serviceConsumption,
                'price',
                this.CloudProjectBillingAgoraService.constructor
                  .formatEmptyConsumption(this.me.currency.symbol).price,
              ),
            },
          };

          return serviceConsumption;
        });
    }
  });
