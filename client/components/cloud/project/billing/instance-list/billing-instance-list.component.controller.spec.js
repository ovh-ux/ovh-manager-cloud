"use strict";

describe("Component: InstanceList", function () {

    var $httpBackend;
    var $componentController;
    var scope;
    var $rootScope;
    var $q;
    var CloudProjectInstanceMock;
    var CloudProjectImageMock;
    var UserMock;
    var ToastMock;
    var $translateMock;

    var controller;
    var projectId = "test";

    beforeEach(module("managerAppMock"));

    beforeEach(inject(function (_$httpBackend_, _$rootScope_, _$componentController_, ssoAuthentication, _$q_) {
        $httpBackend = _$httpBackend_;
        $componentController = _$componentController_;
        scope = _$rootScope_.$new();
        $rootScope = _$rootScope_;
        $q = _$q_;
        ToastMock = {
            success: jasmine.createSpy("success"),
            error: jasmine.createSpy("error")
        };
        $translateMock = {
            instant: jasmine.createSpy("instant")
        };
    }));

    afterEach(inject(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
        scope.$destroy();
    }));

    function mockInstanceApi (allInstances, error) {
        CloudProjectInstanceMock = {
            v6: function () {
                return {
                    get: function () {
                        return {
                            $promise: $q.reject("")
                        };
                    },
                    query: function () {
                        return {
                            $promise: error ? $q.reject(error) : $q.when(allInstances)
                        };
                    }
                };
            }
        };
    }

    function mockImageApi (allImages, error) {
        CloudProjectImageMock = {
            v6: function () {
                return {
                    query: function () {
                        return {
                            $promise: error ? $q.reject(error) : $q.when(allImages)
                        };
                    }
                };
            }
        };
    }

    function initNewCtrl (instanceConsumptions) {

        controller = $componentController("instanceList", {
            $scope: scope,
            $rootScope: $rootScope,
            $stateParams: { projectId: projectId },
            OvhApiCloudProjectInstance: CloudProjectInstanceMock,
            OvhApiCloudProjectImage: CloudProjectImageMock,
            OvhApiMe: UserMock,
            Toast: ToastMock,
            $translate: $translateMock,
        }, {
            instances: instanceConsumptions
        });

        controller.$onInit();
        $httpBackend.flush();
    }

    function mockUserApi (user, error) {
        UserMock = {
            v6: function () {
                return {
                    get: function () {
                        return {
                            $promise: error ? $q.reject(error) : $q.when(user)
                        };
                    }
                };
            }
        };
    }

    describe("Init", function () {
        var instanceId = "5c40dc28-a091-462f-b15e-8fd6d513a4ea";
        var imageId = "9bfac38c-688f-4b63-bf3b-69155463c0e7";

        var instanceConsumptions = [{
            instanceId: instanceId,
            region: "consRegion",
            reference: "constReference",
            totalPrice: 100
        }];

        var allInstances = [{
                id: instanceId,
                name: "name",
                region: "region",
                flavorId: "flavorId",
                reference: "reference",
                imageId: imageId,
            }];

        var allImages = [{
                id: imageId,
                type: "type"
            }];

        var user = {
            currency: {
                symbol: "$"
            }
        };

        it("Should expose instance details for each instance consumption details", function () {
            mockInstanceApi(allInstances);
            mockImageApi(allImages);
            mockUserApi(user);

            initNewCtrl(instanceConsumptions);

            expect(controller.instanceConsumptionDetails[0].instanceId).toEqual(instanceConsumptions[0].instanceId);
            expect(controller.instanceConsumptionDetails[0].instanceName).toEqual(allInstances[0].name);
            expect(controller.instanceConsumptionDetails[0].total).toEqual(instanceConsumptions[0].totalPrice.toFixed(2) + " " + user.currency.symbol);
            expect(controller.instanceConsumptionDetails[0].region).toEqual(instanceConsumptions[0].region);
            expect(controller.instanceConsumptionDetails[0].reference).toEqual(instanceConsumptions[0].reference);
            expect(controller.instanceConsumptionDetails[0].imageType).toEqual(allImages[0].type);
            expect(controller.instanceConsumptionDetails[0].vmType).toEqual(instanceConsumptions[0].reference.toUpperCase());
            expect(controller.instanceConsumptionDetails[0].monthlyBilling).toEqual(allInstances[0].monthlyBilling);
            expect(controller.instanceConsumptionDetails[0].isDeleted).toEqual(false);
        });

        it("Should expose only instance id as name and total when instance no longer exists", function () {
            var allInstances = [{
                id: "different",
                name: "name",
                region: "region",
                flavorId: "flavorId",
                reference: "reference",
                imageId: imageId
            }];
            mockInstanceApi(allInstances);
            mockImageApi(allImages);
            mockUserApi(user);

            initNewCtrl(instanceConsumptions);

            expect(controller.instanceConsumptionDetails[0].instanceId).toEqual(instanceConsumptions[0].instanceId);
            expect(controller.instanceConsumptionDetails[0].instanceName).toEqual(instanceConsumptions[0].instanceId);
            expect(controller.instanceConsumptionDetails[0].total).toEqual(instanceConsumptions[0].totalPrice.toFixed(2) + " " + user.currency.symbol);
            expect(controller.instanceConsumptionDetails[0].region).toEqual(instanceConsumptions[0].region);
            expect(controller.instanceConsumptionDetails[0].reference).toEqual(instanceConsumptions[0].reference);
            expect(controller.instanceConsumptionDetails[0].imageType).toEqual("linux");
            expect(controller.instanceConsumptionDetails[0].vmType).toEqual(instanceConsumptions[0].reference.toUpperCase());
            expect(controller.instanceConsumptionDetails[0].isDeleted).toEqual(true);
        });

        it("Should show error toast on api error", function () {
            mockInstanceApi([], "api error");

            initNewCtrl(instanceConsumptions);

            expect(ToastMock.error).toHaveBeenCalled();
        });
    });
});
