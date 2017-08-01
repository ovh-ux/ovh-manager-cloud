angular.module("managerAppMock").factory("controllerTestUtil", function ($controller, $httpBackend, baseTestUtil) {
    "use strict";
    var testUtil = Object.create(baseTestUtil);

    testUtil.createController = function (controllerName) {
        return $controller(controllerName, {
            $scope: this.$scope
        });
    };

    testUtil.verifyHttpBackend = function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    };

    return testUtil;

});
