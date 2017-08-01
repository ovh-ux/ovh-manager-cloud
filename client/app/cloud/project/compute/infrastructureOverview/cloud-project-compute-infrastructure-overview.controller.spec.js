"use strict";

describe("Controller: CloudProjectComputeInfrastructureOverviewCtrl", function () {

    var $httpBackend;
    var $controller;
    var $state;
    var $q;
    var stateParams = {
        projectId: "id"
    };

    // load the controller"s module
    beforeEach(module("managerAppMock"));

    beforeEach(inject(function (_$httpBackend_, _$controller_, UserLexi, _$q_, _$state_) {
        $httpBackend = _$httpBackend_;
        $controller = _$controller_;
        $state = _$state_;
        $q = _$q_;
        spyOn(UserLexi, "get").and.returnValue({
            $promise: _$q_.when({ ovhSubsidiary: "IT" })
        });
        $httpBackend.whenGET("app/cloud/project/cloud-project.html").respond(200, {});
    }));

    afterEach(inject(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    }));

    var controller;

    function initNewCtrl() {
        controller = $controller("CloudProjectComputeInfrastructureOverviewCtrl", {
            $stateParams: stateParams,
            $state: $state
        });
    }

    describe("initialization", function () {
        it("should fetch the right guide url", function () {
            initNewCtrl();
            $httpBackend.flush();
            expect(controller.guideUrl).toEqual("https://www.ovh.it/g1785.cloud");
        });
    });

    describe("redirectToInterface", function () {
        beforeEach(function() {
            spyOn($state, "go").and.returnValue($q.when(true));
        });

        it("should redirect to overview", function () {
            initNewCtrl();
            controller.redirectToInterface();
            $httpBackend.flush();
            expect($state.go).toHaveBeenCalledWith("iaas.pci-project.compute", { forceLargeProjectDisplay: true }, { reload: true });
        });
    });
});
