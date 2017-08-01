"use strict";

describe("Controller: CloudprojectcomputeinfrastructurevirtualmachinedeleteCtrl", function () {

  // load the controller"s module
  beforeEach(module("managerAppMock"));
    var authentication;
    beforeEach(inject(function ($injector) {
        authentication = $injector.get("ovh-auth.authentication");
        authentication.setIsLogetIn(true);
    }));

  var CloudprojectcomputeinfrastructurevirtualmachinedeleteCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    CloudprojectcomputeinfrastructurevirtualmachinedeleteCtrl = $controller("CloudprojectcomputeinfrastructurevirtualmachinedeleteCtrl", {
      $scope: scope
    });
  }));

  xit("should ...", function () {
    expect(1).toEqual(1);
  });
});
