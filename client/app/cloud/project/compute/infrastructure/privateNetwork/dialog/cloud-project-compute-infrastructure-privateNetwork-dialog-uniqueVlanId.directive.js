angular.module("managerApp").directive("uniqueVlanId", function ($q, $stateParams, CloudProjectNetworkPrivate) {
    "use strict";

    return {
        require: "ngModel",
        restrict: "A",
        link: function (scope, elm, attrs, ngModel) {
            ngModel.$asyncValidators.uniqueVlanId = function (value) {
                if (ngModel.$isEmpty(value)) {
                    return $q.when();
                }

                var defer = $q.defer();

                CloudProjectNetworkPrivate.Lexi().query({
                    serviceName: $stateParams.projectId
                }).$promise.then(function (networks) {
                    if (_.find(networks, { vlanId: value })) {
                        defer.reject();
                    } else {
                        defer.resolve();
                    }
                }, function () {
                    defer.resolve();
                });

                return defer.promise;
            };
        }
    };
});
