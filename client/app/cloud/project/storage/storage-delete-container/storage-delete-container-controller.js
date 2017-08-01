angular.module("managerApp").controller("RA.storage.deleteContainer",
    function ($scope, storage, $uibModalInstance) {
        "use strict";

        $scope.plural = _.isArray(storage) && storage.length > 1;
        $scope.name = _.isArray(storage) ?
            _.map(storage, "name").join(", ") :
            storage.name;

        $scope.valid = {
            value: true
        };

        $scope.confirm = function () {
            $uibModalInstance.close();
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss();
        };
    });
