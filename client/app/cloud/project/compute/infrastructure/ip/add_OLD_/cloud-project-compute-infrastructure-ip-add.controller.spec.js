"use strict";

describe("Controller: CloudProjectComputeInfrastructureIpAddCtrl", function () {

    // load the controller"s module
    beforeEach(module("managerAppMock"));

    var CloudProjectComputeInfrastructureIpAddCtrl, scope;

    // Initialize the controller and a mock scope
    beforeEach(inject(function ($controller, $rootScope) {
        scope = $rootScope.$new();
        CloudProjectComputeInfrastructureIpAddCtrl = $controller("CloudProjectComputeInfrastructureIpAddCtrl", {
            $scope: scope
        });
    }));

    it("should ...", function () {
        expect(1).toEqual(1);
    });
});
