"use strict";
angular.module("managerApp").directive("writeRightRequired", function ($stateParams, CloudProjectRightService) {
    return {
        //The directive must be applied after all directives to overwrite conflicts(ex: ng-if)
        priority: -1001,
        restrict: "A",
        link: function (scope, element) {
            CloudProjectRightService.userHaveReadWriteRights($stateParams.projectId)
                .then(function (hasWriteRight) {
                    if (!hasWriteRight) {
                        element.addClass("hide");
                    }
                });
        }
    };
});

