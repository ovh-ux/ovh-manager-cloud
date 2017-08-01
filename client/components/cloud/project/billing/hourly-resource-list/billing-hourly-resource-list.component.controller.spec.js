"use strict";

describe("Controller: HourlyResourceListCtrl", function () {
    beforeEach(module("managerAppMock"));

    var $controller;
    var scope;
    var $httpBackend;
    var DetailsPopoverService;

    var projectId = "projectIdTest";
    var hourlyResourceListController;

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
        hourlyResourceListController = $controller("BillingHourlyResourceListComponentCtrl", {
            $stateParams: { projectId: projectId },
            $scope: scope
        });
    }

    describe("init success case", function () {
        it("should init toggles to false", function () {
            initNewCtrl();
            $httpBackend.flush();

            expect(hourlyResourceListController.toggle.accordions.instance).toEqual(false);
            expect(hourlyResourceListController.toggle.accordions.objectStorage).toEqual(false);
            expect(hourlyResourceListController.toggle.accordions.archiveStorage).toEqual(false);
            expect(hourlyResourceListController.toggle.accordions.snapshot).toEqual(false);
            expect(hourlyResourceListController.toggle.accordions.volume).toEqual(false);
        });
    });

    describe("toggleAccordion", function () {
        it("should reset popup state", function () {
            spyOn(DetailsPopoverService, "reset");
            initNewCtrl();
            $httpBackend.flush();

            hourlyResourceListController.toggleAccordion();

            expect(DetailsPopoverService.reset).toHaveBeenCalled();
        });
    });
});
