(() => {
    "use strict";
    const allEuropeanSubsidiaries = ["CZ", "DE", "ES", "FI", "FR", "GB", "IE", "IT", "LT", "MA", "NL", "PL", "PT", "SN", "TN"];
    const allCanadianSubsidiaries = ["ASIA", "AU", "CA", "QC", "SG", "WE", "WS"];
    const featuresAvailability = {
        VPS: {
            sidebarOrder: {
                EU: allEuropeanSubsidiaries,
                CA: allCanadianSubsidiaries
            },
            guides: {
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
            sidebarMenu: {
                EU: allEuropeanSubsidiaries,
                CA: allCanadianSubsidiaries
            },
            sidebarOrder: {
                EU: allEuropeanSubsidiaries,
                CA: allCanadianSubsidiaries
            },
            expressOrder: {
                US: ["US"]
            },
            guides: {
                EU: allEuropeanSubsidiaries,
                CA: allCanadianSubsidiaries
            }
        },
        DEDICATED_CLOUD: {
            sidebarMenu: {
                EU: allEuropeanSubsidiaries,
                CA: allCanadianSubsidiaries
            },
            sidebarOrder: {
                EU: allEuropeanSubsidiaries,
                CA: allCanadianSubsidiaries
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
            }
        },
        LOAD_BALANCER: {
            sidebarMenu: {
                EU: allEuropeanSubsidiaries,
                CA: allCanadianSubsidiaries
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
            sidebarMenu: {
                EU: allEuropeanSubsidiaries,
                CA: allCanadianSubsidiaries,
            },
            sidebarOrder: {
                EU: ["FR"]
            }
        },
        CEPH: {
            sidebarOrder: {
                EU: ["FR"]
            }
        },
        VEEAM: {
            sidebarOrder: {
                EU: ["FR"]
            }
        },
        CLOUD_DESKTOP: {
            sidebarOrder: {
                EU: allEuropeanSubsidiaries
            },
            sidebarMenu: {
                EU: allEuropeanSubsidiaries,
                CA: allCanadianSubsidiaries
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
            this.localePromise = this.User.v6().get().$promise
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
