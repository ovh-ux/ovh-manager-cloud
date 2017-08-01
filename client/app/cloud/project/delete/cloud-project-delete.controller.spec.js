"use strict";

xdescribe("Controller: CloudProjectDeleteCtrl", function () {

    // load the controller"s module
    beforeEach(module("managerAppMock"));

    var $controller;
    var scope;
    var modalInstance;
    var translate;
    var $httpBackend;
    var ToastSpy;
    var $state;
    var amountResources = 6;
    var now = moment().format();
    var CloudProjectCreditMock;
    var CloudProjectConsumptionMock;
    var $q;
    var projectBill = 56;

    var projectId = "projectIdTest";

    var projectDeleteController;

    beforeEach(inject(function (_$httpBackend_, $rootScope, _$controller_, $translate, _$state_, _$q_) {
        $httpBackend = _$httpBackend_;
        $controller = _$controller_;
        scope = $rootScope.$new();
        translate = $translate;
        $q = _$q_;
        ToastSpy = {
            success: jasmine.createSpy("ToastSuccess"),
            error: jasmine.createSpy("ToastError")
        };
        $state = _$state_;
        $state.go = jasmine.createSpy("modalInstance.close");

        modalInstance = {
            close: jasmine.createSpy("modalInstance.close"),
            dismiss: jasmine.createSpy("modalInstance.dismiss"),
            result: {
                then: jasmine.createSpy("modalInstance.result.then")
            }
        };
    }));

    afterEach(inject(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
        scope.$destroy();
    }));

    function initNewCtrl () {
        projectDeleteController = $controller("CloudProjectDeleteCtrl", {
            $stateParams: { projectId: projectId },
            $scope: scope,
            Toast: ToastSpy,
            $uibModalInstance: modalInstance,
            $state: $state,
            $translate: translate,
            CloudProjectCredit: CloudProjectCreditMock,
            CloudProjectConsumption: CloudProjectConsumptionMock
        });
    }

    describe("init success case", function () {
        beforeEach(function () {
            var amountResources = 6;
            mockResourcesCalls(200, amountResources);
            mockConsuptionCalls();
        });

        it("should fetch remaining ressources", function () {
            mockValidCreditsCalls(200);
            initNewCtrl();
            $httpBackend.flush();

            expect(projectDeleteController.resources.instance).toEqual(amountResources);
            expect(projectDeleteController.resources.volume).toEqual(amountResources);
            expect(projectDeleteController.resources.snapshot).toEqual(amountResources);
            expect(projectDeleteController.resources.storage).toEqual(amountResources);
            expect(projectDeleteController.resources.ipFailoverOvh).toEqual(amountResources);
            expect(projectDeleteController.resources.ipFailoverCloud).toEqual(amountResources);
        });

        it("should initialize hasCredits to false if credits are 0$", function () {
            mockEmptyCreditsCalls(200);
            initNewCtrl();
            $httpBackend.flush();

            expect(projectDeleteController.hasCredits).toEqual(false);
        });

        it("should initialize hasCredits to true if credits are higher than 0", function () {
            mockValidCreditsCalls(200);
            initNewCtrl();
            $httpBackend.flush();

            expect(projectDeleteController.hasCredits).toEqual(true);
        });

        it("should initialize hasCredits to false if all credits are invalid", function () {
            mockInvalidCreditsCalls(200);
            initNewCtrl();
            $httpBackend.flush();

            expect(projectDeleteController.hasCredits).toEqual(false);
        });

        it("should initialize bill variable", function () {
            initNewCtrl();
            $httpBackend.flush();

            expect(projectDeleteController.bill).toEqual(projectBill);
        });

        it("should load until remaining resources are loaded", function () {
            initNewCtrl();
            expect(projectDeleteController.loaders.init).toEqual(true);
            $httpBackend.flush();

            expect(projectDeleteController.loaders.init).toEqual(false);
        });
    });

    describe("init error case", function () {
        beforeEach(function () {
            var amountResources = 6;
            mockResourcesCalls(400, amountResources);
            mockConsuptionCalls();
        });

        it("should initialise error variable to true if error happen", function () {
            initNewCtrl();
            $httpBackend.flush();

            expect(projectDeleteController.error).toEqual(true);
        });
    });

    describe("confirm", function () {
        beforeEach(function () {
            var amountResources = 6;
            mockResourcesCalls(200, amountResources);
            mockConsuptionCalls();
        });

        it("should close the modal on success", function () {
            initNewCtrl();
            $httpBackend.flush();

            projectDeleteController.confirm();
            $httpBackend.flush();

            expect(modalInstance.close).toHaveBeenCalled();
        });

        it("should display toast on success", function () {
            initNewCtrl();
            $httpBackend.flush();

            projectDeleteController.confirm();
            $httpBackend.flush();

            expect(ToastSpy.success).toHaveBeenCalled();
        });

        it("should display toast error on error", function () {
            initNewCtrl();
            $httpBackend.flush();

            projectDeleteController.confirm();
            $httpBackend.flush();

            expect(ToastSpy.error).toHaveBeenCalled();
        });
    });

    describe("goToSupport", function () {
        beforeEach(function () {
            var amountResources = 6;
            mockResourcesCalls(200, amountResources);
            mockConsuptionCalls();
        });

        it("should close modal", function () {
            initNewCtrl();
            $httpBackend.flush();

            projectDeleteController.goToSupport();

            expect(modalInstance.dismiss).toHaveBeenCalled();
        });

        it("should go to support", function () {
            initNewCtrl();
            $httpBackend.flush();

            projectDeleteController.goToSupport();

            expect($state.go).toHaveBeenCalled();
        });
    });

    function mockResourcesCalls (status, amountElements) {
        var response = [];
        for (var i = 0; i < amountElements; i++) {
            response.push("resource");
        }
    }

    function mockValidCreditsCalls () {
        var creditId = "afg";
        var creditsId = [creditId];

        var validCredit = {
            "available_credit": {
                value: 1
            },
            validity: {
                from: moment(now).subtract(7, "days").format(),
                to: moment(now).add(7, "days").format()
            }
        };

        CloudProjectCreditMock = {
            Lexi: function () {
                return {
                    query: function () {
                        return {
                            $promise: $q.when(creditsId)
                        };
                    },
                    get: function () {
                        return {
                            $promise: $q.when(validCredit)
                        };
                    }
                };
            }
        };
    }

    function mockInvalidCreditsCalls () {
        var creditId = 1;
        var creditsId = [creditId];

        var validCredit = {
            "available_credit": {
                value: 1
            },
            validity: {
                from: moment(now).subtract(7, "days").format(),
                to: moment(now).subtract(1, "days").format()
            }
        };

        CloudProjectCreditMock = {
            Lexi: function () {
                return {
                    query: function () {
                        return {
                            $promise: $q.when(creditsId)
                        };
                    },
                    get: function () {
                        return {
                            $promise: $q.when(validCredit)
                        };
                    }
                };
            }
        };
    }

    function mockEmptyCreditsCalls () {
        var creditId = 1;
        var creditsId = [creditId];

        var emptyCredit = {
            "available_credit": {
                value: 0.00
            },
            validity: {
                from: moment(now).subtract(7, "days").format(),
                to: moment(now).subtract(1, "days").format()
            }
        };

        CloudProjectCreditMock = {
            Lexi: function () {
                return {
                    query: function () {
                        return {
                            $promise: $q.when(creditsId)
                        };
                    },
                    get: function () {
                        return {
                            $promise: $q.when(emptyCredit)
                        };
                    }
                };
            }
        };
    }

    function mockConsuptionCalls () {
        var consuption = {
            current: {
                total: {
                    text: projectBill
                }
            }
        };

        CloudProjectConsumptionMock = {
            Lexi: function () {
                return {
                    query: function () {
                        return {
                            $promise: $q.when(consuption)
                        };
                    }
                };
            }
        };
    }
});
