"use strict";

describe("Controller: CloudProjectBillingHistoryDetailsCtrl", function () {

    var $httpBackend;
    var $controller;
    var scope;
    var $q;
    var $stateParams;
    var validParams;
    var mockCloudProjectUsageHistoryLexi;
    var mockCloudProjectBillingService;
    var mockCloudProjectBillLexi;
    var CloudMessage;
    var projectId = "test";
    var monthBilling;
    var dateMonthBilling;
    var mockUserBillLexi;

    beforeEach(module("managerAppMock"));

    beforeEach(inject(function (_$httpBackend_, _$rootScope_, _$controller_, ssoAuthentication, _$q_, _OvhApiCloudProjectUsageHistoryLexi_, _CloudProjectBillingService_, _$stateParams_, _CloudMessage_, _OvhApiCloudProjectBillLexi_, _OvhApiMeBillLexi_) {
        $httpBackend = _$httpBackend_;
        $controller = _$controller_;
        scope = _$rootScope_.$new();
        $q = _$q_;
        $stateParams = _$stateParams_;
        $stateParams.projectId = projectId;
        dateMonthBilling = new Date(2016, 6, 10);
        monthBilling = moment.utc(dateMonthBilling);
        validParams = {
            year: monthBilling.year(),
            month: monthBilling.month() + 1
        };
        mockCloudProjectUsageHistoryLexi = _OvhApiCloudProjectUsageHistoryLexi_;
        mockCloudProjectBillingService = _CloudProjectBillingService_;
        mockCloudProjectBillLexi = _OvhApiCloudProjectBillLexi_;
        mockUserBillLexi = _OvhApiMeBillLexi_;

        CloudMessage = _CloudMessage_;
        spyOn(CloudMessage, "error");
        spyOn(mockCloudProjectBillLexi, "query").and
            .returnValue({ $promise: $q.when([]) });
        spyOn(mockCloudProjectUsageHistoryLexi, "query").and
            .returnValue({ $promise: $q.when([]) });
        spyOn(mockCloudProjectUsageHistoryLexi, "get").and
            .returnValue({ $promise: $q.when({}) });
        spyOn(mockCloudProjectBillingService, "getDataInitialized").and
            .returnValue($q.when({}));
        spyOn(mockCloudProjectBillingService, "getConsumptionDetails").and
            .returnValue($q.when({}));
        spyOn(mockUserBillLexi, "get").and
            .returnValue($q.when({}));

    }));

    afterEach(inject(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
        scope.$destroy();
    }));

    function initCtrl () {
        return $controller("CloudProjectBillingHistoryDetailsCtrl", {
            validParams
        });
    }

    describe("Init", function () {

        it("Should expose usage details", function () {

            var usageHistory = [{ period: { from: dateMonthBilling } }];
            var usageDetails = { details: { } };
            mockCloudProjectUsageHistoryLexi.query.and
                .returnValue({ $promise: $q.when(usageHistory) });

            mockCloudProjectUsageHistoryLexi.get.and
                .returnValue({ $promise: $q.when(usageHistory[0]) });

            mockCloudProjectBillingService.getConsumptionDetails.and
                .returnValue($q.when(usageDetails));

            var controller = initCtrl();
            $httpBackend.flush();

            expect(controller.data).toBe(usageDetails);
            expect(mockCloudProjectBillingService.getConsumptionDetails).toHaveBeenCalledWith(undefined, usageHistory[0]);
        });

        it("Should show error CloudMessage on api error", function () {
            mockCloudProjectUsageHistoryLexi.query.and
                .returnValue({ $promise: $q.reject("error") });

            initCtrl();
            $httpBackend.flush();

            expect(CloudMessage.error).toHaveBeenCalled();
        });

        it("Should activate loading during async call", function () {
            mockCloudProjectUsageHistoryLexi.query.and
                .returnValue({ $promise: $q.reject("error") });
            var controller = initCtrl();

            expect(controller.loading).toBe(true);
            $httpBackend.flush();
            expect(controller.loading).toBe(false);
        });
    });
});
