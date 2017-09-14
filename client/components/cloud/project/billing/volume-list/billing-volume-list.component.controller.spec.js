"use strict";

describe("Component: VolumeList", function () {

    var $httpBackend;
    var $componentController;
    var scope;
    var $rootScope;
    var $q;
    var CloudProjectVolumeLexi;
    var ToastMock;
    var UserLexi;
    var $translateMock;
    var $stateMock;

    var controller;
    var projectId = "test";
    var CloudPriceLexi;

    beforeEach(module("managerAppMock"));

    beforeEach(inject(function (_$httpBackend_, _$rootScope_, _$componentController_, ssoAuthentication, _$q_, _OvhApiCloudPriceLexi_, _OvhApiCloudProjectVolumeLexi_, _OvhApiMeLexi_) {
        $httpBackend = _$httpBackend_;
        $componentController = _$componentController_;
        scope = _$rootScope_.$new();
        $rootScope = _$rootScope_;
        $q = _$q_;
        CloudPriceLexi = _OvhApiCloudPriceLexi_;
        CloudProjectVolumeLexi = _OvhApiCloudProjectVolumeLexi_;
        UserLexi = _OvhApiMeLexi_;

        ToastMock = {
            success: jasmine.createSpy("success"),
            error: jasmine.createSpy("error")
        };
        $translateMock = {
            instant: jasmine.createSpy("instant")
        };
        $stateMock = {
            go: jasmine.createSpy("instant")
        };
    }));

    afterEach(inject(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
        scope.$destroy();
    }));

    function initNewCtrl (volumeConsumptions) {

        controller = $componentController("volumeList", {
            $scope: scope,
            $rootScope: $rootScope,
            $stateParams: { projectId: projectId },
            Toast: ToastMock,
            $translate: $translateMock,
            $state: $stateMock
        }, {
            volumes: volumeConsumptions
        });
        controller.$onInit();
    }

    describe("Init", function () {

        var volumeConsumptions = [{
            volumeId: "sameId",
            totalPrice: 100,
            region: "region",
            type: "type",
            quantity: { value: 5 }
        }];

        var user = {
            currency: {
                symbol: "$"
            }
        };

        it("Should expose volume details for each volume consumption details", function () {
            var allVolumes = [{
                id: "sameId",
                name: "name",
                totalPrice: 100,
                region: "region",
                type: "type",
                size: 5,
                status: "status"
            }];
            spyOn(CloudProjectVolumeLexi, "query").and
                .returnValue({ $promise: $q.when(allVolumes) });

            spyOn(UserLexi, "get").and
                .returnValue({ $promise: $q.when(user) });

            var price = "price";
            mockPrice("volume." + volumeConsumptions[0].type, volumeConsumptions[0].region, price);

            initNewCtrl(volumeConsumptions);
            $httpBackend.flush();

            expect(controller.volumeConsumptionDetails[0].totalPrice).toEqual(volumeConsumptions[0].totalPrice.toFixed(2) + " " + user.currency.symbol);
            expect(controller.volumeConsumptionDetails[0].volumeId).toEqual(volumeConsumptions[0].volumeId);
            expect(controller.volumeConsumptionDetails[0].name).toEqual(allVolumes[0].name);
            expect(controller.volumeConsumptionDetails[0].region).toEqual(volumeConsumptions[0].region);
            expect(controller.volumeConsumptionDetails[0].type).toEqual(volumeConsumptions[0].type);
            expect(controller.volumeConsumptionDetails[0].size).toEqual(allVolumes[0].size);
            expect(controller.volumeConsumptionDetails[0].status).toEqual(allVolumes[0].status);
            expect(controller.volumeConsumptionDetails[0].priceText).toEqual(price);
            expect(controller.volumeConsumptionDetails[0].amount).toEqual(volumeConsumptions[0].quantity.value);
        });

        it("Should expose volume id as name and status deleted when volume details no longer exists", function () {
            var allVolumes = [{
                volumeId: "different",
                totalPrice: 100,
                region: "region",
                type: "type",
                size: 500,
                status: "status"
            }];
            spyOn(CloudProjectVolumeLexi, "query").and
                .returnValue({ $promise: $q.when(allVolumes) });
            spyOn(UserLexi, "get").and
                .returnValue({ $promise: $q.when(user) });
            mockPrice();

            initNewCtrl(volumeConsumptions);
            $httpBackend.flush();

            expect(controller.volumeConsumptionDetails[0].totalPrice).toEqual(volumeConsumptions[0].totalPrice.toFixed(2) + " " + user.currency.symbol);
            expect(controller.volumeConsumptionDetails[0].name).toEqual(volumeConsumptions[0].volumeId);
            expect(controller.volumeConsumptionDetails[0].region).toEqual(volumeConsumptions[0].region);
            expect(controller.volumeConsumptionDetails[0].type).toEqual(volumeConsumptions[0].type);
            expect(controller.volumeConsumptionDetails[0].size).toBeUndefined();
            expect(controller.volumeConsumptionDetails[0].status).toBe("deleted");
        });

        it("Should expose ? for price when it's not found", function () {
            var allVolumes = [{
            }];
            spyOn(CloudProjectVolumeLexi, "query").and
                .returnValue({ $promise: $q.when(allVolumes) });

            spyOn(UserLexi, "get").and
                .returnValue({ $promise: $q.when(user) });

            mockPrice("different price type");

            initNewCtrl(volumeConsumptions);
            $httpBackend.flush();

            expect(controller.volumeConsumptionDetails[0].priceText).toEqual("?");
        });

        it("Should show error toast on CloudProjectVolume api error", function () {
            spyOn(CloudProjectVolumeLexi, "query").and
                .returnValue({ $promise: $q.reject("api error") });
            spyOn(UserLexi, "get").and
                .returnValue({ $promise: $q.when(user) });
            mockPrice();

            initNewCtrl(volumeConsumptions);
            $httpBackend.flush();

            expect(ToastMock.error).toHaveBeenCalled();
        });

        it("Should show error toast on Price api error", function () {
            spyOn(CloudProjectVolumeLexi, "query").and
                .returnValue({ $promise: $q.when([{}]) });
            spyOn(UserLexi, "get").and
                .returnValue({ $promise: $q.when(user) });
            spyOn(CloudPriceLexi, "query").and
                .returnValue({ $promise: $q.reject("api error") });

            initNewCtrl(volumeConsumptions);
            $httpBackend.flush();

            expect(ToastMock.error).toHaveBeenCalled();
        });

        it("Should activate loading during async call", function () {
            spyOn(CloudProjectVolumeLexi, "query").and
                .returnValue({ $promise: $q.reject("api error") });
            spyOn(UserLexi, "get").and
                .returnValue({ $promise: $q.when(user) });
            mockPrice();

            initNewCtrl(volumeConsumptions);

            expect(controller.loading).toBe(true);
            $httpBackend.flush();
            expect(controller.loading).toBe(false);
        });

        function mockPrice (volumeName, region, price) {
            spyOn(CloudPriceLexi, "query").and
                .returnValue({
                    $promise: $q.when({
                        volumes: [{
                            volumeName: volumeName,
                            region: region,
                            price: {
                                text: price
                            }
                        }]
                    })
                });
        }
    });
});
