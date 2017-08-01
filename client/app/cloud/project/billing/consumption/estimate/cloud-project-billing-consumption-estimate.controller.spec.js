"use strict";

describe("Controller: CloudProjectBillingConsumptionEstimateCtrl", function () {

    var $httpBackend;
    var $rootScope;
    var $controller;
    var $q;
    var $uibModal;
    var $stateParams;
    var $translate;
    var CloudProjectAlerting;
    var Toast;
    var CloudProjectUsageForecast;
    var CloudProjectUsageCurrent;
    var CloudProjectBillingService;
    var scope;
    var projectId = "id";

    beforeEach(module("managerAppMock"));

    beforeEach(inject(function (_$httpBackend_, _$rootScope_, _$controller_, ssoAuthentication, _$q_, _$uibModal_, _$stateParams_, _$translate_, _CloudProjectAlerting_, _Toast_, _CloudProjectUsageForecast_, _CloudProjectUsageCurrent_, _CloudProjectBillingService_) {
        $httpBackend = _$httpBackend_;
        $rootScope = _$rootScope_;
        $controller = _$controller_;
        $q = _$q_;
        $uibModal =  _$uibModal_;
        $stateParams = _$stateParams_;
        $translate = _$translate_;
        CloudProjectAlerting = _CloudProjectAlerting_;
        Toast = _Toast_;
        CloudProjectUsageForecast = _CloudProjectUsageForecast_;
        CloudProjectUsageCurrent = _CloudProjectUsageCurrent_;
        CloudProjectBillingService = _CloudProjectBillingService_;

        scope = _$rootScope_.$new();
        $stateParams.projectId = projectId;

        $httpBackend.whenGET(/cloud\/project\/[a-z0-9]+\/usage\/forecast/).respond(200, {});
        $httpBackend.whenGET(/cloud\/project\/[a-z0-9]+\/usage\/current/).respond(200, {});
        $httpBackend.whenGET(/cloud\/project\/[a-z0-9]+\/alerting/).respond(200, []);
    }));

    afterEach(inject(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
        scope.$destroy();
    }));

    function initCtrl () {
        return $controller("CloudProjectBillingConsumptionEstimateCtrl", {
            $scope: scope
        });
    }

    describe("Init", function () {
        it("Should init forecast", function () {
            var billinginfo = "billingInfo";
            var billingData = {
                totals: {
                    currencySymbol: "$"
                }
            };

            spyOn(CloudProjectUsageForecast.Lexi(), "get").and.returnValue({ $promise: $q.when(billinginfo) });
            spyOn(CloudProjectBillingService, "getConsumptionDetails").and.returnValue($q.when(billingData));

            var controller = initCtrl();
            $httpBackend.flush();

            expect(CloudProjectUsageForecast.Lexi().get).toHaveBeenCalledWith({ serviceName: projectId });
            expect(CloudProjectBillingService.getConsumptionDetails).toHaveBeenCalledWith(billinginfo, billinginfo);
            expect(controller.data.estimateTotals).toBe(billingData.totals);
            expect(controller.data.currencySymbol).toBe(billingData.totals.currencySymbol);
        });

        it("Should manage errors when initing forecast", function () {
            spyOn(CloudProjectUsageForecast.Lexi(), "get").and.returnValue({ $promise: $q.reject({ data: { message: "reason" } }) });
            spyOn($translate, "instant").and.returnValue("error message");
            spyOn(Toast, "error");

            initCtrl();
            $httpBackend.flush();

            expect($translate.instant).toHaveBeenCalledWith("cpbe_estimate_price_error_message");
            expect(Toast.error).toHaveBeenCalledWith("error message reason");
        });

        it("Should init current", function () {
            var billinginfo = "billingInfo";
            var billingData = {
                totals: {
                }
            };

            spyOn(CloudProjectUsageCurrent.Lexi(), "get").and.returnValue({ $promise: $q.when(billinginfo) });
            spyOn(CloudProjectBillingService, "getConsumptionDetails").and.returnValue($q.when(billingData));

            var controller = initCtrl();
            $httpBackend.flush();

            expect(CloudProjectUsageCurrent.Lexi().get).toHaveBeenCalledWith({ serviceName: projectId });
            expect(CloudProjectBillingService.getConsumptionDetails).toHaveBeenCalledWith(billinginfo, billinginfo);
            expect(controller.data.estimateTotals).toBe(billingData.totals);
        });

        it("Should manage errors when initing current", function () {
            spyOn(CloudProjectUsageCurrent.Lexi(), "get").and.returnValue({ $promise: $q.reject({ data: { message: "reason" } }) });
            spyOn($translate, "instant").and.returnValue("error message");
            spyOn(Toast, "error");
            spyOn(CloudProjectBillingService, "getConsumptionDetails").and.returnValue($q.when({ totals: { } }));

            initCtrl();
            $httpBackend.flush();

            expect($translate.instant).toHaveBeenCalledWith("cpbe_estimate_price_error_message");
            expect(Toast.error).toHaveBeenCalledWith("error message reason");
        });

        it("Should init alert", function () {
            spyOn(CloudProjectBillingService, "getConsumptionDetails").and.returnValue($q.when({ totals: { currencySymbol: "$", hourly: { total: "hourlyTotal" } } }));
            spyOn(CloudProjectAlerting.Lexi(), "getIds").and.returnValue({ $promise: $q.when(["alertId"]) });
            spyOn($translate, "instant").and.returnValue("label");

            var alert = {
                monthlyThreshold: "monthlyThreshold"
            };
            spyOn(CloudProjectAlerting.Lexi(), "get").and.returnValue({ $promise: $q.when(alert) });

            var controller = initCtrl();
            $httpBackend.flush();

            expect(controller.data.alert).toBe(alert);

            expect(controller.consumptionChartData).toEqual({
                estimate: {
                    now: { value: "hourlyTotal", currencyCode: "$", label: "label" },
                    endOfMonth: { value: "hourlyTotal", currencyCode: "$", label: "label" }
                },
                threshold: {
                    now: { value: "monthlyThreshold", currencyCode: "$", label: "label" },
                    endOfMonth: { value: "monthlyThreshold", currencyCode: "$", label: "label" }
                }
            });
        });

        it("Should init alert when getIds return an empty array", function () {
            spyOn(CloudProjectBillingService, "getConsumptionDetails").and.returnValue($q.when({ totals: { currencySymbol: "$", hourly: { total: "hourlyTotal" } } }));
            spyOn(CloudProjectAlerting.Lexi(), "getIds").and.returnValue({ $promise: $q.when([]) });
            spyOn($translate, "instant").and.returnValue("label");
            spyOn(Toast, "error");

            var alert = {
                monthlyThreshold: "monthlyThreshold"
            };
            spyOn(CloudProjectAlerting.Lexi(), "get").and.returnValue({ $promise: $q.when(alert) });

            var controller = initCtrl();
            $httpBackend.flush();

            expect(controller.data.alert).toBe(null);
            expect(controller.consumptionChartData).toBe(undefined);
            expect(Toast.error).not.toHaveBeenCalled();
        });

        it("Should manage error when CloudProjectAlerting.getIds return an error", function () {
            spyOn(CloudProjectBillingService, "getConsumptionDetails").and.returnValue($q.when({ totals: {} }));
            spyOn(CloudProjectAlerting.Lexi(), "getIds").and.returnValue({ $promise: $q.reject({ data: { message: "reason" } }) });
            spyOn($translate, "instant").and.returnValue("error message");
            spyOn(Toast, "error");

            var controller = initCtrl();
            $httpBackend.flush();

            expect($translate.instant).toHaveBeenCalledWith("cpbe_estimate_price_error_message");
            expect(Toast.error).toHaveBeenCalledWith("error message reason");
            expect(controller.data.alert).toBe(null);
        });

        it("Should manage error when CloudProjectAlerting.get return an error", function () {
            spyOn(CloudProjectBillingService, "getConsumptionDetails").and.returnValue($q.when({ totals: {} }));
            spyOn(CloudProjectAlerting.Lexi(), "getIds").and.returnValue({ $promise: $q.when(["alertId"]) });
            spyOn(CloudProjectAlerting.Lexi(), "get").and.returnValue({ $promise: $q.reject({ data: { message: "reason" } }) });
            spyOn(Toast, "error");

            var controller = initCtrl();
            $httpBackend.flush();

            expect(controller.data.alert).toBe(null);
            expect(controller.consumptionChartData).toBe(undefined);
            expect(Toast.error).not.toHaveBeenCalled();
        });
    });
});
