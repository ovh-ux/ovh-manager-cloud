"use strict";

describe("Controller: HomeCtrl", function () {

  // load the controller"s module
    var authentication;
    beforeEach(inject(function ($injector) {
        authentication = $injector.get("ovh-auth.authentication");
        authentication.setIsLogetIn(true);
    }));

  var HomeCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    HomeCtrl = $controller("HomeCtrl", {
      $scope: scope
    });
  }));

  xit("should ...", function () {
    expect(1).toEqual(1);
  });
});
