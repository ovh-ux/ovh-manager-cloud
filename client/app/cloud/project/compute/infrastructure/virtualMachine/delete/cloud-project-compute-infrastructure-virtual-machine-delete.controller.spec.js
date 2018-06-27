"use strict";

describe("Controller: cloudProjectComputeInfrastructureVirtualMachineDeleteCtrl", () => {

    // load the controller"s module
    beforeEach(module("managerAppMock"));
    let authentication;
    beforeEach(inject($injector => {
        authentication = $injector.get("ovh-auth.authentication");
        authentication.setIsLogetIn(true);
    }));

    let cloudProjectComputeInfrastructureVirtualMachineDeleteCtrl,
        scope;

    // Initialize the controller and a mock scope
    beforeEach(inject(($controller, $rootScope) => {
        scope = $rootScope.$new();
        cloudProjectComputeInfrastructureVirtualMachineDeleteCtrl = $controller("cloudProjectComputeInfrastructureVirtualMachineDeleteCtrl", {
            $scope: scope
        });
    }));

    xit("should ...", () => {
        expect(1).toEqual(1);
    });
});
