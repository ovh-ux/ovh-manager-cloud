"use strict";

describe("Controller config: CloudProjectAddCtrl", function () {

    var controller;
    var util;


    beforeEach(module("managerAppMock"));

    beforeEach(inject(function (controllerTestUtil, _atInternet_) {
        util = controllerTestUtil;
        spyOn(_atInternet_, "trackClick");
        controller = util.createController("CloudProjectAddCtrl");
    }));

    afterEach(inject(function () {
        util.verifyHttpBackend();
    }));

    describe("atInternet track Click on Cloud Project activation", function () {
        it("should track click on project creation when activation is set", inject(function ($httpBackend,atInternet) {
            controller.model = { contractsAccepted: true };
            controller.data = { agreements: [{}] };

            controller.createProject();
            $httpBackend.flush();

            expect(atInternet.trackClick).toHaveBeenCalledWith({
                name: "AccountActivation"
            });
        }));
    });
    describe("atInternet track Click on Cloud Project already activated", function () {
        it("should not track click on project creation if agreements is empty", inject(function ($httpBackend,atInternet) {
            controller.model = { contractsAccepted: true };
            controller.data = { agreements: [] };

            controller.createProject();
            $httpBackend.flush();

            expect(atInternet.trackClick).not.toHaveBeenCalled();
        }));
    });
});
