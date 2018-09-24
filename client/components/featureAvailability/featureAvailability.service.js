(() => {
  const allEuropeanSubsidiaries = ['CZ', 'DE', 'ES', 'FI', 'FR', 'GB', 'IE', 'IT', 'LT', 'MA', 'NL', 'PL', 'PT', 'SN', 'TN'];
  const allCanadianSubsidiaries = ['ASIA', 'AU', 'CA', 'QC', 'SG', 'WE', 'WS'];
  const featuresAvailability = {
    VPS: {
      sidebarMenu: {
        EU: allEuropeanSubsidiaries,
        CA: allCanadianSubsidiaries,
      },
      sidebarOrder: {
        EU: allEuropeanSubsidiaries,
        CA: allCanadianSubsidiaries,
      },
      guides: {
        EU: allEuropeanSubsidiaries,
        CA: allCanadianSubsidiaries,
      },
    },
    SERVER: {
      sidebarMenu: {
        EU: allEuropeanSubsidiaries,
        CA: allCanadianSubsidiaries,
        US: ['US'],
      },
      sidebarOrder: {
        EU: allEuropeanSubsidiaries,
        CA: allCanadianSubsidiaries,
        US: ['US'],
      },
    },
    PROJECT: {
      sidebarMenu: {
        EU: allEuropeanSubsidiaries,
        CA: allCanadianSubsidiaries,
      },
      sidebarOrder: {
        EU: allEuropeanSubsidiaries,
        CA: allCanadianSubsidiaries,
        US: ['US'],
      },
      expressOrder: {
        US: ['US'],
      },
      guides: {
        EU: allEuropeanSubsidiaries,
        CA: allCanadianSubsidiaries,
      },
    },
    DEDICATED_CLOUD: {
      sidebarMenu: {
        EU: allEuropeanSubsidiaries,
        CA: allCanadianSubsidiaries,
      },
      sidebarOrder: {
        EU: allEuropeanSubsidiaries,
        CA: allCanadianSubsidiaries,
      },
    },
    IP: {
      sidebarMenu: {
        EU: allEuropeanSubsidiaries,
        CA: allCanadianSubsidiaries,
        US: ['US'],
      },
      sidebarOrder: {
        EU: allEuropeanSubsidiaries,
        CA: allCanadianSubsidiaries,
        US: ['US'],
      },
    },
    LOAD_BALANCER: {
      sidebarMenu: {
        EU: allEuropeanSubsidiaries,
        CA: allCanadianSubsidiaries,
      },
      sidebarOrder: {
        EU: allEuropeanSubsidiaries,
      },
    },
    VRACK: {
      sidebarMenu: {
        EU: allEuropeanSubsidiaries,
        CA: allCanadianSubsidiaries,
        US: ['US'],
      },
      sidebarOrder: {
        EU: allEuropeanSubsidiaries,
        CA: allCanadianSubsidiaries,
        US: ['US'],
      },
    },
    LICENSE: {
      sidebarMenu: {
        EU: allEuropeanSubsidiaries,
        CA: allCanadianSubsidiaries,
        US: ['US'],
      },
      sidebarOrder: {
        EU: allEuropeanSubsidiaries,
        CA: allCanadianSubsidiaries,
        US: ['US'],
      },
    },
    NASHA: {
      sidebarMenu: {
        EU: allEuropeanSubsidiaries,
        CA: allCanadianSubsidiaries,
      },
      sidebarOrder: {
        EU: allEuropeanSubsidiaries,
        CA: allCanadianSubsidiaries,
      },
    },
    METRICS: {
      sidebarMenu: {
        EU: allEuropeanSubsidiaries,
        CA: allCanadianSubsidiaries,
      },
      sidebarOrder: {
        EU: ['FR'],
      },
    },
    CEPH: {
      sidebarMenu: {
        EU: ['FR'],
        US: ['US'],
      },
      sidebarOrder: {
        EU: ['FR'],
      },
    },
    VEEAM: {
      sidebarMenu: {
        EU: ['FR'],
      },
      sidebarOrder: {
        EU: ['FR'],
      },
    },
    CLOUD_DESKTOP: {
      sidebarMenu: {
        EU: allEuropeanSubsidiaries,
        CA: allCanadianSubsidiaries,
      },
      sidebarOrder: {
        EU: allEuropeanSubsidiaries,
      },
    },
    CONTACTS: {
      manage: {
        EU: allEuropeanSubsidiaries,
      },
    },
    DBAAS_LOGS: {
      sidebarMenu: {
        EU: allEuropeanSubsidiaries,
        CA: ['CA', 'QC'],
      },
      sidebarOrder: {
        EU: allEuropeanSubsidiaries,
        CA: ['CA', 'QC'],
      },
    },
  };

  class FeatureAvailabilityService {
    constructor(OvhApiMe, TARGET) {
      this.User = OvhApiMe;
      this.TARGET = TARGET;

      this.locale = null;
      this.localePromise = this.User.v6().get().$promise
        .then((user) => {
          this.locale = user.ovhSubsidiary;
          return user.ovhSubsidiary;
        });
    }

    hasFeature(product, feature, locale = this.locale) {
      if (!_.has(featuresAvailability, [product, feature, this.TARGET])) {
        return false;
      }
      return _.indexOf(featuresAvailability[product][feature][this.TARGET], locale) !== -1;
    }

    hasFeaturePromise(product, feature) {
      return this.localePromise.then(locale => this.hasFeature(product, feature, locale));
    }
  }
  angular.module('managerApp').service('FeatureAvailabilityService', FeatureAvailabilityService);
})();
