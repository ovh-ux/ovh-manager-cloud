"use strict";

describe("Component: VolumeList", function () {

    var $httpBackend;
    var $componentController;
    var scope;
    var $rootScope;
    var $q;
    var CloudProjectVolumeV6;
    var ToastMock;
    var UserV6;
    var $translateMock;
    var $stateMock;

    var controller;
    var projectId = "test";

    beforeEach(module("managerAppMock"));

    beforeEach(inject(function (_$httpBackend_, _$rootScope_, _$componentController_, ssoAuthentication, _$q_, _OvhApiCloudProjectVolumeV6_, _OvhApiMeV6_) {
        $httpBackend = _$httpBackend_;
        $componentController = _$componentController_;
        scope = _$rootScope_.$new();
        $rootScope = _$rootScope_;
        $q = _$q_;
        CloudProjectVolumeV6 = _OvhApiCloudProjectVolumeV6_;
        UserV6 = _OvhApiMeV6_;

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
        },{
            volumes : volumeConsumptions
        });
        controller.$onInit();
    }

    describe("Init", function () {

        const volumeConsumptions = [{
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
            spyOn(CloudProjectVolumeV6, "query").and
                .returnValue({ $promise: $q.when(allVolumes) });

            spyOn(UserV6, "get").and
                .returnValue({ $promise: $q.when(user) });

            initNewCtrl(volumeConsumptions);
            $httpBackend.flush();
            expect(controller.volumeConsumptionDetails[0].totalPrice).toEqual(volumeConsumptions[0].totalPrice.toFixed(2) + " " + user.currency.symbol);
            expect(controller.volumeConsumptionDetails[0].volumeId).toEqual(volumeConsumptions[0].volumeId);
            expect(controller.volumeConsumptionDetails[0].name).toEqual(allVolumes[0].name);
            expect(controller.volumeConsumptionDetails[0].region).toEqual(volumeConsumptions[0].region);
            expect(controller.volumeConsumptionDetails[0].type).toEqual(volumeConsumptions[0].type);
            expect(controller.volumeConsumptionDetails[0].size).toEqual(allVolumes[0].size);
            expect(controller.volumeConsumptionDetails[0].status).toEqual(allVolumes[0].status);
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
            spyOn(CloudProjectVolumeV6, "query").and
                .returnValue({ $promise: $q.when(allVolumes) });
            spyOn(UserV6, "get").and
                .returnValue({ $promise: $q.when(user) });

            initNewCtrl(volumeConsumptions);
            $httpBackend.flush();

            expect(controller.volumeConsumptionDetails[0].totalPrice).toEqual(volumeConsumptions[0].totalPrice.toFixed(2) + " " + user.currency.symbol);
            expect(controller.volumeConsumptionDetails[0].name).toEqual(volumeConsumptions[0].volumeId);
            expect(controller.volumeConsumptionDetails[0].region).toEqual(volumeConsumptions[0].region);
            expect(controller.volumeConsumptionDetails[0].type).toEqual(volumeConsumptions[0].type);
            expect(controller.volumeConsumptionDetails[0].size).toBeUndefined();
            expect(controller.volumeConsumptionDetails[0].status).toBe("deleted");
        });

        it("Should show error toast on CloudProjectVolume api error", function () {
            spyOn(CloudProjectVolumeV6, "query").and
                .returnValue({ $promise: $q.reject("api error") });
            spyOn(UserV6, "get").and
                .returnValue({ $promise: $q.when(user) });

            initNewCtrl(volumeConsumptions);
            $httpBackend.flush();

            expect(ToastMock.error).toHaveBeenCalled();
        });

        it("Should activate loading during async call", function () {
            spyOn(CloudProjectVolumeV6, "query").and
                .returnValue({ $promise: $q.reject("api error") });
            spyOn(UserV6, "get").and
                .returnValue({ $promise: $q.when(user) });

            initNewCtrl(volumeConsumptions);

            expect(controller.loading).toBe(true);
            $httpBackend.flush();
            expect(controller.loading).toBe(false);
        });

    });
});
