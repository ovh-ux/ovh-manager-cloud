"use strict";

describe("Controller: CloudCtrl", function () {

  // load the controller"s module
  beforeEach(module("managerAppMock"));

  var CloudCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    CloudCtrl = $controller("CloudCtrl", {
      $scope: scope
    });
  }));

  it("should ...", function () {
    expect(1).toEqual(1);
  });
});
