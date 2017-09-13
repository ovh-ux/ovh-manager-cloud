describe("CloudProjectComputeSnapshotPriceService service", function () {
    "use strict";

    beforeEach(module("managerAppMock"));

    var $q = null;
    var $rootScope = null;
    var service = null;
    var cloudPriceLexiMock = null;
    beforeEach(inject(function (_$q_, _$rootScope_, CloudProjectComputeSnapshotPriceService, OvhApiCloudPriceLexi) {
        $q = _$q_;
        $rootScope = _$rootScope_;
        service = CloudProjectComputeSnapshotPriceService;
        cloudPriceLexiMock = OvhApiCloudPriceLexi;
    }));

    describe("splitSubnetIpAddresses", function () {
        it("should return correct data for snapshot size 1", function () {
            var snapshotSize = 1;
            var priceData = {
                snapshots: [{
                    region: "GRA1",
                    monthlyPrice: {
                        currencyCode: "EUR",
                        text: "0.01 €",
                        value: 0.01
                    }
                }]
            };
            spyOn(cloudPriceLexiMock, "query").and.returnValue({ $promise: $q.when(priceData) });

            service.getSnapshotPrice(snapshotSize).then(function (data) {
                expect(data).toEqual([{
                    region: "GRA1",
                    monthlyPrice: {
                        currencyCode: "EUR",
                        text: "0.01 €",
                        value: 0.01
                    },
                    totalPrice: {
                        currencyCode: "EUR",
                        text: "0.01 €",
                        value: 0.01
                    }
                }]);
            });

            $rootScope.$apply();
        });

        it("should return correct data for snapshot size 12", function () {
            var snapshotSize = 12;
            var priceData = {
                snapshots: [{
                    region: "GRA2",
                    monthlyPrice: {
                        currencyCode: "EUR",
                        text: "0.01 €",
                        value: 0.01
                    }
                }]
            };
            spyOn(cloudPriceLexiMock, "query").and.returnValue({ $promise: $q.when(priceData) });

            service.getSnapshotPrice(snapshotSize).then(function (data) {
                expect(data).toEqual([{
                    region: "GRA2",
                    monthlyPrice: {
                        currencyCode: "EUR",
                        text: "0.01 €",
                        value: 0.01
                    },
                    totalPrice: {
                        currencyCode: "EUR",
                        text: "0.12 €",
                        value: 0.12
                    }
                }]);
            });

            $rootScope.$apply();
        });

        it("should round correctly at 2 digits", function () {
            var snapshotSize = 10;
            var priceData = {
                snapshots: [{
                    region: "GRA3",
                    monthlyPrice: {
                        currencyCode: "EUR",
                        text: "0.333333 €",
                        value: 0.333333
                    }
                }]
            };
            spyOn(cloudPriceLexiMock, "query").and.returnValue({ $promise: $q.when(priceData) });

            service.getSnapshotPrice(snapshotSize).then(function (data) {
                expect(data).toEqual([{
                    region: "GRA3",
                    monthlyPrice: {
                        currencyCode: "EUR",
                        text: "0.333333 €",
                        value: 0.333333
                    },
                    totalPrice: {
                        currencyCode: "EUR",
                        text: "3.34 €",
                        value: 3.34
                    }
                }]);
            });

            $rootScope.$apply();
        });
    });
});