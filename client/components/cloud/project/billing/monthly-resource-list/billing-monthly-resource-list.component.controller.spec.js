"use strict";

describe("Controller: MonthlyResourceListCtrl", function () {
    beforeEach(module("managerAppMock"));

    var $controller;
    var scope;
    var $httpBackend;
    var DetailsPopoverService;

    var projectId = "projectIdTest";
    var monthlyResourceListController;

    beforeEach(inject(function (_$httpBackend_, $rootScope, _$controller_, _DetailsPopoverService_) {
        $httpBackend = _$httpBackend_;
        $controller = _$controller_;
        scope = $rootScope.$new();
        DetailsPopoverService = _DetailsPopoverService_;

    }));

    afterEach(inject(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
        scope.$destroy();
    }));

    function initNewCtrl () {
        monthlyResourceListController = $controller("BillingMonthlyResourceListComponentCtrl", {
            $stateParams: { projectId: projectId },
            $scope: scope
        });
    }

    describe("init success case", function () {
        it("should init toggles to false", function () {
            initNewCtrl();
            $httpBackend.flush();

            expect(monthlyResourceListController.toggle.accordions.instance).toEqual(false);
        });
    });

    describe("toggleAccordion", function () {
        it("should set reset popup state", function () {
            spyOn(DetailsPopoverService, "reset");
            initNewCtrl();
            $httpBackend.flush();

            monthlyResourceListController.toggleAccordion();

            expect(DetailsPopoverService.reset).toHaveBeenCalled();
        });
    });
});
