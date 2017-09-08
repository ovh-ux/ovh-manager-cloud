"use strict";

describe("Controller: CloudProjectBillingConsumptionCurrentCtrl", function () {

    var $httpBackend;
    var $controller;
    var scope;
    var $rootScope;
    var $stateParams;
    var $translate;
    var $q;
    var User;
    var OvhApiCloudProjectAlerting;
    var Toast;
    var uibModalInstance;

    beforeEach(module("managerAppMock"));

    beforeEach(inject(function (_$httpBackend_, _$rootScope_, _$controller_, ssoAuthentication, _$stateParams_, _$translate_, _$q_, _OvhApiMe_, _OvhApiCloudProjectAlerting_, _Toast_) {
        $httpBackend = _$httpBackend_;
        $controller = _$controller_;
        scope = _$rootScope_.$new();
        $rootScope = _$rootScope_;
        $stateParams = _$stateParams_;
        $translate = _$translate_;
        $q = _$q_;
        User = _OvhApiMe_;
        OvhApiCloudProjectAlerting = _OvhApiCloudProjectAlerting_;
        Toast = _Toast_;

        uibModalInstance = {
            close: function () {},
            dismiss: function () {},
            result: function () {}
        };

        scope.$resolve = {
                dataContext: {
                }
            };

        $stateParams.projectId = "projectId";
    }));

    afterEach(inject(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
        scope.$destroy();
    }));

    function initCtrl () {
        return $controller("CloudProjectBillingConsumptionEstimateAlertAddCtrl", {
            $scope: scope,
            $uibModalInstance: uibModalInstance,
            dataContext: scope.$resolve.dataContext
        });
    }

    describe("Init", function () {
        it("Should init currency", function () {
            scope.$resolve = {
                dataContext: {
                    currencySymbol: "$"
                }
            };

            var controller = initCtrl();
            $httpBackend.flush();

            expect(controller.alerting.currency).toBe(scope.$resolve.dataContext.currencySymbol);
        });

        it("Should init alert when there is an alert in scope dataContext", function () {
            scope.$resolve = {
                dataContext: {
                    alert: {
                        email: "email",
                        monthlyThreshold: "thresHold",
                        id: "alertId"
                    }
                }
            };

            var controller = initCtrl();
            $httpBackend.flush();

            expect(controller.model.email).toBe(scope.$resolve.dataContext.alert.email);
            expect(controller.model.threshold).toBe(scope.$resolve.dataContext.alert.monthlyThreshold);
            expect(controller.alerting.id).toBe(scope.$resolve.dataContext.alert.id);
            expect(controller.alerting.email).toBe(scope.$resolve.dataContext.alert.email);
            expect(controller.alerting.threshold).toBe(scope.$resolve.dataContext.alert.monthlyThreshold);
        });

        it("Should init alert when there is no alert in scope dataContext", function () {
            var controller = initCtrl();
            $httpBackend.flush();

            expect(controller.model.email).toBe("");
            expect(controller.model.threshold).toBe(null);
            expect(controller.alerting.id).toBe(null);
            expect(controller.alerting.email).toBe("");
            expect(controller.alerting.threshold).toBe(null);
        });
    });

    describe("saveAlert", function () {
        it("Should create alert when no previous alert exists", function () {
            var controller = initCtrl();

            controller.alerting.id = null;
            controller.alerting.defaultDelay = 1234;
            controller.model.email = "mail";
            controller.model.threshold = "threshold";

            spyOn(OvhApiCloudProjectAlerting.Lexi(), "save").and.returnValue({ $promise: $q.when() });

            var successMessage = "success message";
            spyOn($translate, "instant").and.returnValue(successMessage);

            spyOn(Toast, "success");
            spyOn(uibModalInstance, "close");

            controller.saveAlert();
            $httpBackend.flush();

            expect(OvhApiCloudProjectAlerting.Lexi().save).toHaveBeenCalledWith({ serviceName: "projectId" }, {
                delay: 1234,
                email: "mail",
                monthlyThreshold: "threshold"
            });
            expect(uibModalInstance.close).toHaveBeenCalled();
            expect(Toast.success).toHaveBeenCalledWith(successMessage);
        });

        it("Should handles save error correctly", function () {
            var controller = initCtrl();

            spyOn(OvhApiCloudProjectAlerting.Lexi(), "save").and.returnValue({ $promise: $q.reject({ data: { message: "reason" } }) });

            var errorMessage = "error message";
            spyOn($translate, "instant").and.returnValue(errorMessage);

            spyOn(Toast, "error");
            spyOn(uibModalInstance, "close");

            controller.saveAlert();
            $httpBackend.flush();

            expect(uibModalInstance.close).toHaveBeenCalled();
            expect(Toast.error).toHaveBeenCalledWith("error message reason");
        });

        it("Should edit alert when previous alert exists", function () {
            var controller = initCtrl();

            controller.alerting.id = "alertid";
            controller.alerting.defaultDelay = 1234;
            controller.model.email = "mail";
            controller.model.threshold = "threshold";

            spyOn(OvhApiCloudProjectAlerting.Lexi(), "put").and.returnValue({ $promise: $q.when() });

            var successMessage = "success message";
            spyOn($translate, "instant").and.returnValue(successMessage);

            spyOn(Toast, "success");
            spyOn(uibModalInstance, "close");

            controller.saveAlert();
            $httpBackend.flush();

            expect(OvhApiCloudProjectAlerting.Lexi().put).toHaveBeenCalledWith({ serviceName: "projectId", alertId: "alertid" }, {
                delay: 1234,
                email: "mail",
                monthlyThreshold: "threshold"
            });
            expect(uibModalInstance.close).toHaveBeenCalled();
            expect(Toast.success).toHaveBeenCalledWith(successMessage);
        });

        it("Should handles put error correctly", function () {
            var controller = initCtrl();

            controller.alerting.id = "alertid";
            spyOn(OvhApiCloudProjectAlerting.Lexi(), "put").and.returnValue({ $promise: $q.reject({ data: { message: "reason" } }) });

            var errorMessage = "error message";
            spyOn($translate, "instant").and.returnValue(errorMessage);

            spyOn(Toast, "error");
            spyOn(uibModalInstance, "close");

            controller.saveAlert();
            $httpBackend.flush();

            expect(uibModalInstance.close).toHaveBeenCalled();
            expect(Toast.error).toHaveBeenCalledWith("error message reason");
        });
    });

    describe("closeModal", function () {
        it("Should dismiss the modal", function () {
            var controller = initCtrl();
            spyOn(uibModalInstance, "dismiss");

            controller.closeModal();
            $httpBackend.flush();

            expect(uibModalInstance.dismiss).toHaveBeenCalled();
        });
    });
});
