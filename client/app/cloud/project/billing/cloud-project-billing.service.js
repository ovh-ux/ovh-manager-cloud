angular.module('managerApp')
  .service('CloudProjectBillingService',
    class {
      /* @ngInject */
      constructor(
        OvhApiCloudProject,
        OvhApiCloudProjectServiceInfos,
        OvhApiMeConsumption,
        OvhApiServiceRenewForecast,
        CLOUD_PROJECT_CONSUMPTION_PLANCODE_CONVERSION,
        CLOUD_PROJECT_CONSUMPTION_SUFFIX,
      ) {
        this.OvhApiCloudProject = OvhApiCloudProject;
        this.OvhApiCloudProjectServiceInfos = OvhApiCloudProjectServiceInfos;
        this.OvhApiMeConsumption = OvhApiMeConsumption;
        this.OvhApiServiceRenewForecast = OvhApiServiceRenewForecast;
        this.PLANCODE_CONVERSION = CLOUD_PROJECT_CONSUMPTION_PLANCODE_CONVERSION;
        this.CLOUD_PROJECT_CONSUMPTION_SUFFIX = CLOUD_PROJECT_CONSUMPTION_SUFFIX;
      }

      getIfProjectUsesAgora(serviceName) {
        return this.OvhApiCloudProject.v6().get({ serviceName }).$promise
          .then(({ planCode }) => planCode !== 'project.legacy' && planCode !== 'project.2018');
      }

      getProjectServiceInfos(serviceName) {
        return this.OvhApiCloudProject.ServiceInfos().v6().get({ serviceName }).$promise;
      }

      getCurrentForecast(serviceId) {
        return this.OvhApiMeConsumption.Usage().Forecast().v6().get().$promise
          .then(forecast => _.find(forecast, { serviceId }));
      }

      getCurrentConsumption(serviceId) {
        return this.OvhApiMeConsumption.Usage().Current().v6().get().$promise
          .then(consumption => _.find(consumption, { serviceId }));
      }

      getBillForecast(serviceId) {
        return this.OvhApiServiceRenewForecast.v6()
          .get({ serviceId, includeOptions: true }).$promise;
      }

      static formatPrice(value, currencyCode) {
        return ({
          value,
          text: `${value.toFixed(2)} ${currencyCode}`,
        });
      }

      formatEmptyPrice(currencyCode) {
        return this.constructor.formatPrice(0, currencyCode);
      }

      static groupConsumptionByFamily(consumption) {
        return _.groupBy(
          consumption,
          ({ planFamily }) => _.camelCase(planFamily),
        );
      }

      static getTotalPrice(consumption, currencySymbol) {
        const totalPrice = consumption
          .reduce((totalValue, { price }) => parseFloat(
            // Float arithmetic is not always accurate
            (totalValue + price.value).toFixed(10),
          ),
          0);
        return {
          value: totalPrice,
          text: `${totalPrice} ${currencySymbol}`,
        };
      }

      formatHourlyConsumption(consumption, currencySymbol) {
        return _.mapValues(consumption, planConsumption => ({
          price: this.constructor.getTotalPrice(planConsumption, currencySymbol),
        }));
      }
    });
