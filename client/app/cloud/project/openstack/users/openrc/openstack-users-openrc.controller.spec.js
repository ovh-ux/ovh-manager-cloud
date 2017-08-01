"use strict";

describe("Controller: OpenstackUsersOpenrcCtrl", function () {

    // load the controller"s module
    beforeEach(module("managerAppMock"));
    var authentication;
    beforeEach(inject(function ($injector) {
        authentication = $injector.get("ovh-auth.authentication");
        authentication.setIsLogetIn(true);
    }));

    var OpenstackUsersOpenrcCtrl;
    var scope;

    // Initialize the controller and a mock scope
    beforeEach(inject(function ($controller, $rootScope) {
        scope = $rootScope.$new();
        OpenstackUsersOpenrcCtrl = $controller("OpenstackUsersOpenrcCtrl", {
            $scope: scope
        });
    }));

    xit("should ...", function () {
        expect(1).toEqual(1);
    });
});
