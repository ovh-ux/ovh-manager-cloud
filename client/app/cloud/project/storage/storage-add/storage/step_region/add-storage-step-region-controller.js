angular.module('managerApp').controller('RA.add.storage.stepRegionCtrl',
  ['$scope', 'RegionService',
    function ($scope, RegionService) {
      $scope.regionService = RegionService;
      $scope.childStep = 'containerType';

      $scope.model.region = null;

      $scope.clickOnRegion = function () {
        $scope.loadStep($scope.childStep);
      };
    },
  ]);
