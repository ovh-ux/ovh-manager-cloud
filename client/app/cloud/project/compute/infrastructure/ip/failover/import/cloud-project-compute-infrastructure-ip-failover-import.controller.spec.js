"use strict";

describe("Controller: CloudProjectComputeInfrastructureIpFailoverImportCtrl", function () {

  // load the controller"s module
  beforeEach(module("managerAppMock"));

  var CloudProjectComputeInfrastructureIpFailoverImportCtrl, scope, uibModalInstance;

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
    CloudProjectComputeInfrastructureIpFailoverImportCtrl = $controller("CloudProjectComputeInfrastructureIpFailoverImportCtrl", {
      $scope: scope,
      $uibModalInstance : uibModalInstance,
      pendingImportIps : []
    });
  }));

  xit("should ...", function () {
    expect(1).toEqual(1);
  });
});
