angular.module("managerApp").controller("RA.add.storage.stepRegionCtrl",
	["$scope", "RegionService",
    function ($scope, RegionService) {
        "use strict";

        $scope.regionService = RegionService;
        $scope.childStep = "containerType";

        $scope.model.region = null;

        $scope.clickOnRegion = function (region) {
            $scope.model.region = region;
            $scope.loadStep($scope.childStep);
        };

    }
]);
