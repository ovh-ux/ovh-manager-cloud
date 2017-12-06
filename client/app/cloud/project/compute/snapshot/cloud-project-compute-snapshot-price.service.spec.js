describe("CloudProjectComputeSnapshotPriceService service", function () {
    "use strict";

    beforeEach(module("managerAppMock"));

    var $q = null;
    var $rootScope = null;
    var service = null;
    var orderCatalogFormattedLexi = null;
    beforeEach(inject(function (_$q_, _$rootScope_, CloudProjectComputeSnapshotPriceService, OvhApiOrderCatalogFormattedLexi, OvhApiCloudProjectLexi, OvhApiMeLexi) {
        $q = _$q_;
        $rootScope = _$rootScope_;
        orderCatalogFormattedLexi = OvhApiOrderCatalogFormattedLexi;
        service = CloudProjectComputeSnapshotPriceService;
        spyOn(OvhApiMeLexi, "get").and.returnValue({ $promise: $q.when({ country: "FR" })});
        spyOn(OvhApiCloudProjectLexi, "get").and.returnValue({ $promise: $q.when({ planCode: "project" }) });
    }));

    function mockPriceData(priceData) {
        return {
            plans: [
                {
                    planCode: "project",
                    addonsFamily : [
                        {
                            family: "snapshot",
                            addons: [
                                {
                                    plan: {
                                        planCode : "snapshot.consumption",
                                        details: {
                                            pricings : {
                                                default : [priceData]
                                            }
                                        },
                                    }
                                }
                            ],
                        }
                    ],
                }
            ]
        };
    }

    describe("splitSubnetIpAddresses", function () {
        it("should return correct data for snapshot size 1", function () {
            var snapshotSize = 1;
            var priceData = mockPriceData({
                price: {
                    currencyCode: "EUR",
                    text: "0.00 €",
                    value: 0.00
                },
                priceInUcents : 1388,
            })
            spyOn(orderCatalogFormattedLexi, "get").and.returnValue({ $promise: $q.when(priceData) });

            service.getSnapshotPrice(snapshotSize, "", "GRA1").then(function (data) {
                expect(data).toEqual({
                    monthlyPrice: {
                        currencyCode: "EUR",
                        text: "0.01 €",
                        value: data.monthlyPrice.value,
                    },
                    totalPrice: {
                        currencyCode: "EUR",
                        text: "0.01 €",
                        value: data.totalPrice.value,
                    },
                    price: {
                        currencyCode: "EUR",
                        text: "0.00 €",
                        value: 0.00
                    },
                    priceInUcents: 1388,
                });
            });

            $rootScope.$apply();
        });

        it("should return correct data for snapshot size 12", function () {
            var snapshotSize = 12;
            var priceData = mockPriceData({
                price: {
                    currencyCode: "EUR",
                    text: "0.00 €",
                    value: 0.00
                },
                priceInUcents : 1388,
            });

            spyOn(orderCatalogFormattedLexi, "get").and.returnValue({ $promise: $q.when(priceData) });

            service.getSnapshotPrice(snapshotSize, "", "").then(function (data) {
                expect(data).toEqual({
                    monthlyPrice: {
                        currencyCode: "EUR",
                        text: "0.01 €",
                        value: data.monthlyPrice.value,
                    },
                    totalPrice: {
                        currencyCode: "EUR",
                        text: "0.12 €",
                        value: data.totalPrice.value,
                    },
                    price: {
                        currencyCode: "EUR",
                        text: "0.00 €",
                        value: 0.00
                    },
                    priceInUcents: 1388
                });
            });

            $rootScope.$apply();
        });

        it("should round correctly at 2 digits", function () {
            var snapshotSize = 10;
            var priceData = mockPriceData({
                price: {
                    currencyCode: "EUR",
                    text: "0.00 €",
                    value: 0.00
                },
                priceInUcents : 46388,
            });
            spyOn(orderCatalogFormattedLexi, "get").and.returnValue({ $promise: $q.when(priceData) });

            service.getSnapshotPrice(snapshotSize, "", "").then(function (data) {
                expect(data).toEqual({
                    monthlyPrice: {
                        currencyCode: "EUR",
                        text: "0.33 €",
                        value: data.monthlyPrice.value,
                    },
                    totalPrice: {
                        currencyCode: "EUR",
                        text: "3.34 €",
                        value: data.totalPrice.value,
                    },
                    price: {
                        currencyCode: "EUR",
                        text: "0.00 €",
                        value: 0.00
                    },
                    priceInUcents: 46388
                });
            });

            $rootScope.$apply();
        });
    });
});
