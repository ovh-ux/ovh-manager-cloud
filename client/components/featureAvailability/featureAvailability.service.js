(() => {
    "use strict";
    const allEuropeanSubsidiaries = ["CZ", "DE", "ES", "FI", "FR", "GB", "IE", "IT", "LT", "MA", "NL", "PL", "PT", "SN", "TN"];
    const allCanadianSubsidiaries = ["ASIA", "AU", "CA", "QC", "SG", "WE", "WS"];
    const featuresAvailability = {
        VPS: {
            sidebarOrder: {
                EU: allEuropeanSubsidiaries,
                CA: allCanadianSubsidiaries
            }
        },
        SERVER: {
            sidebarOrder: {
                EU: allEuropeanSubsidiaries,
                CA: allCanadianSubsidiaries,
                US: ["US"]
            }
        },
        PROJECT: {
            sidebarOrder: {
                EU: allEuropeanSubsidiaries,
                CA: allCanadianSubsidiaries,
                US: ["US"]
            },
            expressOrder: {
                US: ["US"]
            }
        },
        DEDICATED_CLOUD: {
            sidebarOrder: {
                EU: allEuropeanSubsidiaries,
                CA: allCanadianSubsidiaries,
                US: ["US"]
            }
        },
        ip: {
            sidebarOrder: {
                EU: allEuropeanSubsidiaries,
                CA: allCanadianSubsidiaries,
                US: ["US"]
            }
        },
        iplb: {
            sidebarOrder: {
                EU: allEuropeanSubsidiaries,
                // CA: allCanadianSubsidiaries, TODO : to remove when iplb order prodded in CA
                US: ["US"]
            }
        },
        VRACK: {
            sidebarOrder: {
                EU: allEuropeanSubsidiaries,
                CA: allCanadianSubsidiaries,
                US: ["US"]
            }
        },
        licence: {
            sidebarOrder: {
                EU: allEuropeanSubsidiaries,
                CA: allCanadianSubsidiaries,
                US: ["US"]
            }
        },
        NASHA: {
            sidebarOrder: {
                EU: allEuropeanSubsidiaries,
                CA: allCanadianSubsidiaries
            }
        },
        METRICS: {
            sidebarOrder: {
                EU: ["FR"],
                US: ["US"]
            }
        },
        CEPH: {
            sidebarOrder: {
                EU: ["FR"],
                US: ["US"]
            }
        },
        VEEAM: {
            sidebarOrder: {
                EU: ["FR"]
            }
        },
        CLOUD_DESKTOP: {
            sidebarOrder: {
                EU: ["FR"]
            },
            sidebarMenu: {
                EU: ["FR"]
            }
        },
        CONTACTS: {
            manage: {
                EU: allEuropeanSubsidiaries
            }
        }
    };

    class FeatureAvailabilityService {
        constructor (OvhApiMe, TARGET) {
            this.User = OvhApiMe;
            this.TARGET = TARGET;

            this.locale = null;
            this.localePromise = this.User.Lexi().get().$promise
                .then(user => {
                    this.locale = user.ovhSubsidiary;
                    return user.ovhSubsidiary;
                });
        }

        hasFeature (product, feature, locale = this.locale) {
            if (!_.has(featuresAvailability, [product, feature, this.TARGET])) {
                return false;
            }
            return _.indexOf(featuresAvailability[product][feature][this.TARGET], locale) !== -1;
        }

        hasFeaturePromise (product, feature) {
            return this.localePromise.then(locale => this.hasFeature(product, feature, locale));
        }

    }
    angular.module("managerApp").service("FeatureAvailabilityService", FeatureAvailabilityService);
})();
