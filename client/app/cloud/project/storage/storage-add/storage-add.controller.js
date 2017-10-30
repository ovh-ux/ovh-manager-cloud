angular.module("managerApp").controller("RA.storageAddCtrl",
    function ($scope, $stateParams, $translate, ovhDocUrl) {
        "use strict";

        $scope.projectId = $stateParams.projectId;

        // guides
        $scope.guides = {
            title: $translate.instant("storage_details_guide_title"),
            list: [
                {
                    name: $translate.instant("storage_details_guide"),
                    url: ovhDocUrl.getDocUrl("storage")
                }
            ],
            footer: $translate.instant("storage_details_guide_footer")

        };

        $scope.addedType = {
            value: "storage"
        };

        $scope.contentTitle = $translate.instant("add_title") + " " + $translate.instant("add_storage").toLowerCase();

        $scope.$on("reload-add", function () {
            $scope.init();
        });
    });
