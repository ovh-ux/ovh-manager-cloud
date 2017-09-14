"use strict";

describe("Controller: CloudProjectBillingConsumptionCurrentCtrl", function () {

    var $httpBackend;
    var $controller;
    var scope;
    var $rootScope;
    var $q;
    var $stateParams;
    var CloudProjectUsageCurrentLexi;
    var CloudProjectBillingService;
    var Toast;
    var projectId = "test";

    beforeEach(module("managerAppMock"));

    beforeEach(inject(function (_$httpBackend_, _$rootScope_, _$controller_, ssoAuthentication, _$q_, _OvhApiCloudProjectUsageCurrentLexi_, _CloudProjectBillingService_, _$stateParams_, _Toast_) {
        $httpBackend = _$httpBackend_;
        $controller = _$controller_;
        scope = _$rootScope_.$new();
        $rootScope = _$rootScope_;
        $q = _$q_;
        $stateParams = _$stateParams_;
        $stateParams.projectId = projectId;
        CloudProjectUsageCurrentLexi = _OvhApiCloudProjectUsageCurrentLexi_;
        CloudProjectBillingService = _CloudProjectBillingService_;

        Toast = _Toast_;
        spyOn(Toast, "error");
    }));

    afterEach(inject(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
        scope.$destroy();
    }));

    function initCtrl () {
        return $controller("CloudProjectBillingConsumptionCurrentCtrl");
    }

    describe("Init", function () {

        it("Should expose usage details", function () {
            var usage = { usage: {} };
            var detail = { detail: {} };
            spyOn(CloudProjectUsageCurrentLexi, "get").and
                .returnValue({ $promise: $q.when(usage) });

            spyOn(CloudProjectBillingService, "getConsumptionDetails").and
                .returnValue($q.when(detail));

            var controller = initCtrl();
            $httpBackend.flush();

            expect(controller.data).toBe(detail);
        });

        it("Should show error toast on api error", function () {
            spyOn(CloudProjectUsageCurrentLexi, "get").and
                .returnValue({ $promise: $q.reject("error") });

            initCtrl();
            $httpBackend.flush();

            expect(Toast.error).toHaveBeenCalled();
        });

        it("Should activate loading during async call", function () {
            spyOn(CloudProjectUsageCurrentLexi, "get").and
                .returnValue({ $promise: $q.reject("error") });

            var controller = $controller("CloudProjectBillingConsumptionCurrentCtrl");

            expect(controller.loading).toBe(true);
            $httpBackend.flush();
            expect(controller.loading).toBe(false);
        });
    });
});
