describe("Service: CloudStorageContainer", () => {
    const serviceName = "veeam1234";
    const offer = "offer1";
    const duration = "01";

    let $q;
    let $rootScope;

    let Veeam;
    let VeeamService;

    beforeEach(module("managerAppMock"));

    beforeEach(inject([
        "$q",
        "$rootScope",
        "Veeam",
        "VeeamService", function (
            _$q,
            _$rootScope,
            _OvhApiVeeam,
            _VeeamService) {
            $q = _$q;
            $rootScope = _$rootScope;
            Veeam = _OvhApiVeeam;
            VeeamService = _VeeamService;
            setupVeeamMocks();
        }]));

    describe("getConfigurationInfo", () => {
        it("should get configuration info", (done) => {
            const promise = VeeamService.getConfigurationInfos(serviceName)
                .then(result => {
                    assertFormattedResponse(result);
                    expect(result.data.detail).toBeUndefined();
                    expect(result.data.location).toBeDefined();
                    expect(result.data.backupCount).toEqual(2);
                });

            $rootScope.$apply();
            done();
            return promise;
        });
    });

    describe("getStorages", () => {
        it("should get storages", (done) => {
            const promise = VeeamService.getStorages(serviceName)
                .then(result => {
                    assertFormattedResponse(result);
                    expect(result.data).toBeArray();
                    expect(result.data.length).toEqual(2);
                });

            $rootScope.$apply();
            done();
            return promise;
        });
    });

    describe("getSubscriptionInfos", () => {
        it("should get subscription infos", (done) => {
            const promise = VeeamService.getSubscriptionInfos(serviceName)
                .then(result => {
                    assertFormattedResponse(result);
                    expect(result.data.details).toBeDefined();
                    expect(result.data.serviceInfos).toBeArray();
                });

            $rootScope.$apply();
            done();
            return promise;
        });
    });

    describe("getOrderableOffers", () => {
        it("should get orderable offers", (done) => {
            const promise = VeeamService.getOrderableOffers(serviceName)
                .then(result => {
                    assertFormattedResponse(result);
                    expect(result.data).toBeArray();
                    expect(result.data.length).toEqual(2);
                });

            $rootScope.$apply();
            done();
            return promise;
        });
    });

    describe("getOrderableOfferPrices", () => {
        it("should get orderable offer prices", (done) => {
            const promise = VeeamService.getOrderableOfferPrices(serviceName)
                .then(result => {
                    assertFormattedResponse(result);
                    expect(result.data).toBeArray();
                    expect(result.data.length).toEqual(6);
                });

            $rootScope.$apply();
            done();
            return promise;
        });
    });

    describe("createUpgradeOrder", () => {
        it("should upgrade order", (done) => {
            const promise = VeeamService.updateOffer(serviceName, offer, duration)
                .then(result => {
                    assertFormattedResponse(result);
                });

            $rootScope.$apply();
            done();
            return promise;
        });
    });

    describe("addBackupRepository", () => {
        it("should add backup repository", (done) => {
            const promise = VeeamService.addBackupRepository(serviceName)
                .then(result => {
                    assertFormattedResponse(result);
                });

            $rootScope.$apply();
            done();
            return promise;
        });
    });

    describe("updateRepositoryQuota", () => {
        it("should upgrade repository quota", (done) => {
            const promise = VeeamService.updateRepositoryQuota(serviceName)
                .then(result => {
                    assertFormattedResponse(result);
                });

            $rootScope.$apply();
            done();
            return promise;
        });
    });

    describe("getCapabilities", () => {
        it("should get Veeam capabilities", (done) => {
            const promise = VeeamService.getCapabilities(serviceName)
                .then(result => {
                    expect(result.canDoThis).toBeDefined();
                });

            $rootScope.$apply();
            done();
            return promise;
        });
    });

    function setupVeeamMocks() {
        spyOn(Veeam.Lexi(), "getDetails")
            .and.returnValue(resourceResult({
                location: "sbg1"
            }));

        spyOn(Veeam.Lexi(), "getInventories")
            .and.returnValue(resourceResult([
                "a",
                "b"
            ]));

        spyOn(Veeam.Lexi(), "getInventory")
            .and.returnValue(resourceResult({
                name: "XXX"
            }));

        spyOn(Veeam.Lexi(), "getServiceInfos")
            .and.returnValue(resourceResult({
                expiration: "EXPIRATION"
            }));

        spyOn(Veeam.Lexi(), "getOrderableOffers")
            .and.returnValue(resourceResult([
                "offer1",
                "offer2"
            ]));

        spyOn(Veeam.Lexi(), "getOrderUpgradeDurations")
            .and.returnValue(resourceResult([
                "01",
                "06",
                "12"
            ]));

        spyOn(Veeam.Lexi(), "getOrderUpgradeDurationsPrices")
            .and.returnValue(resourceResult({
                orderId: null,
                url: null,
                details: [{
                    domain: "veeamcc68346661",
                    totalPrice: {
                        currencyCode: "EUR",
                        value: 0,
                        text: "0.00 €"
                    },
                    detailType: "INSTALLATION",
                    quantity: 1,
                    unitPrice: {
                        currencyCode: "EUR",
                        value: 0,
                        text: "0.00 €"
                    },
                    description: "Veeam Cloud Connect - Mise à jour du compte vers l'offre Advanced"
                }, {
                    domain: "veeamcc68346661",
                    totalPrice: {
                        currencyCode: "EUR",
                        value: 1.99,
                        text: "1.99 €"
                    },
                    detailType: "DURATION",
                    quantity: 1,
                    unitPrice: {
                        currencyCode: "EUR",
                        value: 1.99,
                        text: "1.99 €"
                    },
                    description: "Veeam Cloud Connect - Pro - 1 mois"
                }]
            }));

        spyOn(Veeam.Lexi(), "createUpgradeOrder")
            .and.returnValue(resourceResult(true));

        spyOn(Veeam.Lexi(), "addInventory")
            .and.returnValue(resourceResult(true));

        spyOn(Veeam.Lexi(), "upgradeQuota")
            .and.returnValue(resourceResult(true));

        spyOn(Veeam.Lexi(), "capabilities")
            .and.returnValue(resourceResult({
                canDoThis: true,
                canDoThat: false
            }));
    }

    function assertFormattedResponse (response) {
        expect(response).toBeObject();
        expect(response.status).toBeDefined();
        expect(response.data).toBeDefined();
    }

    function resourceResult (result) {
        return {
            $promise: $q.resolve(result)
        };
    }
});
