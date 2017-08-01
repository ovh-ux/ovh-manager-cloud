"use strict";

describe("Controller: CloudProjectCtrl", function () {

  // load the controller"s module
  beforeEach(module("managerAppMock"));

  var CloudProjectCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    CloudProjectCtrl = $controller("CloudProjectCtrl", {
      $scope: scope
    });
  }));

  it("should ...", function () {
    expect(1).toEqual(1);
  });
});
