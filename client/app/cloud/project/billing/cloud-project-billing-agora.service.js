angular.module('managerApp')
  .service('CloudProjectBillingAgoraService',
    class {
      /* @ngInject */
      constructor(
        OvhApiCloudProjectServiceInfos,
        OvhApiMeConsumption,
        OvhApiOrderCatalogFormatted,
        CLOUD_PROJECT_CONSUMPTION_PLANCODE_CONVERSION,
        CLOUD_PROJECT_CONSUMPTION_SUFFIX,
      ) {
        this.OvhApiCloudProjectServiceInfos = OvhApiCloudProjectServiceInfos;
        this.OvhApiMeConsumption = OvhApiMeConsumption;
        this.OvhApiOrderCatalogFormatted = OvhApiOrderCatalogFormatted;
        this.PLANCODE_CONVERSION = CLOUD_PROJECT_CONSUMPTION_PLANCODE_CONVERSION;
        this.CLOUD_PROJECT_CONSUMPTION_SUFFIX = CLOUD_PROJECT_CONSUMPTION_SUFFIX;
      }

      getCurrentConsumption(serviceId) {
        return this.OvhApiMeConsumption.Usage().Current().v6().get().$promise
          .then(consumption => _.find(consumption, { serviceId }));
      }

      getProjectServiceInfos(serviceName) {
        return this.OvhApiCloudProjectServiceInfos.v6().get({ serviceName }).$promise;
      }

      getCloudCatalog(ovhSubsidiary) {
        return this.OvhApiOrderCatalogFormatted.v6().get({ catalogName: 'cloud', ovhSubsidiary }).$promise;
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
