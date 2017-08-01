"use strict";

describe("Controller: CloudprojectaddCtrl", function () {

    // load the controller"s module
    beforeEach(module("managerAppMock"));
    var authentication;
    beforeEach(inject(function ($injector) {
        authentication = $injector.get("ovh-auth.authentication");
        authentication.setIsLogetIn(true);
    }));

    var CloudprojectaddCtrl;
    var scope;

    // Initialize the controller and a mock scope
    beforeEach(inject(function ($controller, $rootScope) {
        scope = $rootScope.$new();
        CloudprojectaddCtrl = $controller("CloudprojectaddCtrl", {
            $scope: scope
        });
    }));

    xit("should ...", function () {
        expect(1).toEqual(1);
    });
});
