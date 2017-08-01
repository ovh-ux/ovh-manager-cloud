angular.module("managerApp").controller("RA.storage.deleteObject",
    function ($scope, params, $uibModalInstance) {
        "use strict";

        $scope.elem = params;

        $scope.loaders = {
            deleting: false
        };
        $scope.valid = {
            value: true
        };

        $scope.names = function () {
            return _.map($scope.elem, "name").join("<br />");
        };

        $scope.confirm = function () {
            $uibModalInstance.close($scope.elem);
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss();
        };
    });
