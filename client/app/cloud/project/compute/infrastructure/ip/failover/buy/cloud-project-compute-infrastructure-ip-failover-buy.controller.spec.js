"use strict";

describe("Controller: CloudProjectComputeInfrastructureIpFailoverBuyCtrl", function () {

  // load the controller"s module
  beforeEach(module("managerAppMock"));

  var CloudProjectComputeInfrastructureIpFailoverBuyCtrl, scope, uibModalInstance;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    uibModalInstance = {                    // Create a mock object using spies
      close: jasmine.createSpy('modalInstance.close'),
      dismiss: jasmine.createSpy('modalInstance.dismiss'),
      result: {
        then: jasmine.createSpy('modalInstance.result.then')
      }
    };
    CloudProjectComputeInfrastructureIpFailoverBuyCtrl = $controller("CloudProjectComputeInfrastructureIpFailoverBuyCtrl", {
      $scope: scope,
      $uibModalInstance : uibModalInstance
    });
  }));

  it("should ...", function () {
    expect(1).toEqual(1);
  });
});
