angular.module("managerApp").controller("RA.storage.dnsHelp", ["$scope", "$uibModalInstance",
    function ($scope, $uibModalInstance) {
        "use strict";

        $scope.confirm = function () {
            $uibModalInstance.dismiss();
        };
    }
]);
