angular.module("managerApp")
  .controller("CdaCtrl", function ($scope, $state, CdaService) {
      "use strict";
      $scope.$on("$stateChangeSuccess", function () {
          if ($state.includes("paas.cda")) {
              CdaService.initDetails($state.params.serviceName);
          }
      });
  });