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

      formatInstanceHourlyConsumption(instanceConsumption, currencySymbol) {
        if (!instanceConsumption) {
          return this.constructor.formatEmptyConsumption(currencySymbol);
        }

        return ({
          price: this.constructor.getTotalPrice(instanceConsumption, currencySymbol),
          elements: _.flatten(instanceConsumption.map(
            ({ details, planCode }) => details
              .map(detail => ({
                ...this.constructor.formatInstanceConsumptionMetadatas(detail),
                type: planCode.replace(this.CLOUD_PROJECT_CONSUMPTION_SUFFIX, ''),
              })),
          )),
        });
      }

      groupConsumptionByRegion(storageConsumption) {
        return _.map(storageConsumption
          .reduce((consumptionByRegion, { planCode, details }) => details
            .reduce((regionsConsumption, { metadatas, price, quantity }) => {
              const region = metadatas.find(({ key }) => key === 'region').value;
              return ({
                ...regionsConsumption,
                [region]: {
                  ...regionsConsumption[region],
                  [this.convertStoragePlanCode(planCode)]: {
                    price,
                    quantity: {
                      value: quantity,
                    },
                  },
                },
              });
            }, consumptionByRegion), {}),
        (consumption, region) => ({ ...consumption, region }));
      }

      convertStoragePlanCode(planCode) {
        return _.findKey(
          this.PLANCODE_CONVERSION, consumptionType => consumptionType.test(planCode),
        );
      }

      formatConsumptionByRegion(storageConsumption, currencySymbol) {
        return ({
          price: this.constructor.getTotalPrice(storageConsumption, currencySymbol),
          elements: this.groupConsumptionByRegion(storageConsumption),
        });
      }

      static formatEmptyConsumption(currencySymbol) {
        return ({
          price: {
            value: 0,
            text: `0 ${currencySymbol}`,
          },
          elements: [],
        });
      }

      static formatInstanceConsumptionMetadatas({ metadatas, price, quantity }) {
        return {
          ...metadatas.reduce(
            (formattedMetadatas, { key, value }) => ({
              ...formattedMetadatas,
              [_.camelCase(key)]: value,
            }),
            {},
          ),
          price,
          quantity,
        };
      }
    });
