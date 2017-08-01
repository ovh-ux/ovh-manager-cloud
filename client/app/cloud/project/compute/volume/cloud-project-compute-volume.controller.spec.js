"use strict";

describe("Controller: CloudprojectcomputevolumeCtrl", function () {

  // load the controller"s module
  beforeEach(module("managerAppMock"));
    var authentication;
    beforeEach(inject(function ($injector) {
        authentication = $injector.get("ovh-auth.authentication");
        authentication.setIsLogetIn(true);
    }));

  var CloudprojectcomputevolumeCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    CloudprojectcomputevolumeCtrl = $controller("CloudprojectcomputevolumeCtrl", {
      $scope: scope
    });
  }));

  xit("should ...", function () {
    expect(1).toEqual(1);
  });
});
