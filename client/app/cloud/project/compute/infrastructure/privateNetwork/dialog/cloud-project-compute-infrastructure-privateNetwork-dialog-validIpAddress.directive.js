angular.module("managerApp").directive("validIpAddress",
  function (CloudProjectComputeInfrastructurePrivateNetworkDialogService) {
    "use strict";

    return {
        require: "ngModel",
        restrict: "A",
        link: function (scope, elm, attrs, ngModel) {
            ngModel.$validators.validIpAddress = function (value) {
                return CloudProjectComputeInfrastructurePrivateNetworkDialogService.isIPv4(value);
            };
        }
    };
});
