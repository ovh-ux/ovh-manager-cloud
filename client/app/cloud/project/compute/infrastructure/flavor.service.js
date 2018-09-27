(() => {
  const oldFlavorRegex = /eg|sp|hg|vps-ssd/;

  class CloudFlavorService {
    constructor($filter, CLOUD_FLAVORTYPE_CATEGORY, CLOUD_INSTANCE_CPU_FREQUENCY) {
      this.$filter = $filter;
      this.CLOUD_FLAVORTYPE_CATEGORY = CLOUD_FLAVORTYPE_CATEGORY;
      this.CLOUD_INSTANCE_CPU_FREQUENCY = CLOUD_INSTANCE_CPU_FREQUENCY;
    }

    static isOldFlavor(flavorName) {
      return oldFlavorRegex.test(flavorName);
    }

    static getFlavorTypes(flavors) {
      return _.uniq(_.map(flavors, 'type'));
    }

    static addPriceInfos(flavor, prices) {
      const price = { price: { value: 0 }, monthlyPrice: { value: 0 } };
      const planHourly = prices[_.get(flavor, 'planCodes.hourly')];
      if (planHourly) {
        _.set(price, 'price', planHourly.price);
        // Set 3 digits for hourly price
        _.set(price, 'price.text', _.get(price, 'price.text', '').replace(/\d+(?:[.,]\d+)?/, `${price.price.value.toFixed(3)}`));
      }
      const planMonthly = prices[_.get(flavor, 'planCodes.monthly')];
      if (planMonthly) {
        _.set(price, 'monthlyPrice', planMonthly.price);
      }
      _.set(flavor, 'price', price);
    }

    static addOverQuotaInfos(flavor, quota, minDisk = 0, minRam = 0) {
      const quotaByRegion = _.find(quota, { region: flavor.region });
      const instanceQuota = _.get(quotaByRegion, 'instance', false);
      if (instanceQuota) {
        // set over quota reason
        if (instanceQuota.maxInstances !== -1 && instanceQuota.usedInstances >= instanceQuota.maxInstances) {
          flavor.disabled = 'QUOTA_INSTANCE';
        } else if (flavor.ram && instanceQuota.maxRam !== -1 && flavor.ram > instanceQuota.maxRam - instanceQuota.usedRAM) {
          flavor.disabled = 'QUOTA_RAM';
        } else if (flavor.vcpus && instanceQuota.maxCores !== -1 && flavor.vcpus > instanceQuota.maxCores - instanceQuota.usedCores) {
          flavor.disabled = 'QUOTA_VCPUS';
        }

        // set max instances (-1 : unlimited)
        if (instanceQuota.maxInstances === -1) {
          flavor.maxInstance = -1;
        } else {
          flavor.maxInstance = instanceQuota.maxInstances - instanceQuota.usedInstances;
        }

        if (instanceQuota.maxRam === -1) {
          flavor.maxInstance = Math.max(flavor.maxInstance, -1);
        } else {
          flavor.maxInstance = Math.min(flavor.maxInstance > -1 ? flavor.maxInstance : 1000, Math.floor((instanceQuota.maxRam - instanceQuota.usedRAM) / flavor.ram));
        }

        if (instanceQuota.maxCores === -1) {
          flavor.maxInstance = Math.max(flavor.maxInstance, -1);
        } else {
          flavor.maxInstance = Math.min(flavor.maxInstance > -1 ? flavor.maxInstance : 1000, Math.floor((instanceQuota.maxCores - instanceQuota.usedCores) / flavor.vcpus));
        }
      }

      if (minDisk > flavor.disk && !flavor.disabled) {
        flavor.disabled = 'QUOTA_MINDISK';
      }

      if (minRam > flavor.ram && !flavor.disabled) {
        flavor.disabled = 'QUOTA_MINRAM';
      }
    }

    getQuotaRam(flavor, quota) {
      const quotaByRegion = _.find(quota, { region: flavor.region });
      const instanceQuota = _.get(quotaByRegion, 'instance', false);
      if (instanceQuota) {
        return {
          max: this.$filter('bytes')(instanceQuota.maxRam, 0, false, 'MB'),
          used: this.$filter('bytes')(instanceQuota.usedRAM, 0, false, 'MB'),
          remaining: this.$filter('bytes')(instanceQuota.maxRam - instanceQuota.usedRAM, 0, false, 'MB'),
          required: this.$filter('bytes')(flavor.ram, 0, false, 'MB'),
        };
      }
      return null;
    }

    getQuotaCore(flavor, quota) {
      const quotaByRegion = _.find(quota, { region: flavor.region });
      const instanceQuota = _.get(quotaByRegion, 'instance', false);
      if (instanceQuota) {
        return {
          max: instanceQuota.maxCores,
          used: instanceQuota.usedCores,
          remaining: instanceQuota.maxCores - instanceQuota.usedCores,
          required: flavor.vcpus,
        };
      }
      return null;
    }

    getRequirements(flavor, image) {
      return {
        name: _.get(image, 'name', undefined),
        currentDisk: this.$filter('bytes')(flavor.disk, 2, false, 'GB'),
        currentRam: this.$filter('bytes')(flavor.ram, 2, false, 'MB'),
        requiredDisk: this.$filter('bytes')(image.minDisk, 2, false, 'GB') || undefined,
        requiredRam: this.$filter('bytes')(image.minRam, 2, false, 'MB') || undefined,
      };
    }

    augmentFlavor(flavor) {
      if (!flavor) {
        return null;
      }

      const augmentedFlavor = _.cloneDeep(flavor);
      augmentedFlavor.frequency = this.CLOUD_INSTANCE_CPU_FREQUENCY[flavor.type];

      if (/vps/.test(flavor.type)) {
        augmentedFlavor.vps = true;
        augmentedFlavor.diskType = 'ssd';
        augmentedFlavor.flex = false;
        augmentedFlavor.shortGroupName = flavor.name;
      } else {
        let shortType;
        let numberType;
        if (flavor.osType === 'windows') {
          shortType = _.first(_.rest(flavor.name.split('-')));
          numberType = _.first(_.rest(_.rest(flavor.name.split('-'))));
        } else {
          shortType = _.first(flavor.name.split('-'));
          numberType = _.first(_.rest(flavor.name.split('-')));
        }
        if (shortType) {
          augmentedFlavor.shortType = shortType;
        }
        if (numberType) {
          augmentedFlavor.numberType = numberType;
        }
        if (shortType && numberType) {
          augmentedFlavor.shortGroupName = `${shortType}-${numberType}`;
        }
        augmentedFlavor.flex = /flex$/.test(flavor.name);
        augmentedFlavor.diskType = /ssd/.test(flavor.type) ? 'ssd' : 'ceph';

        if (_.indexOf(['g1', 'g2', 'g3'], augmentedFlavor.shortType) > -1) {
          if (flavor.osType === 'windows') {
            augmentedFlavor.imageType = ['uefi'];
          }
          if (numberType === '120') {
            augmentedFlavor.gpuCardCount = 3;
          } else {
            augmentedFlavor.gpuCardCount = 1;
          }
        }
        augmentedFlavor.isOldFlavor = oldFlavorRegex.test(flavor.name);
      }

      return augmentedFlavor;
    }

    getCategory(flavorType, withDetails = false) {
      let category = null;
      for (const c of this.CLOUD_FLAVORTYPE_CATEGORY) {
        if (_.includes(c.types, flavorType)) {
          category = withDetails ? c : _.get(c, 'id');
          break;
        }
      }
      return category;
    }
  }

  angular.module('managerApp').service('CloudFlavorService', CloudFlavorService);
})();
