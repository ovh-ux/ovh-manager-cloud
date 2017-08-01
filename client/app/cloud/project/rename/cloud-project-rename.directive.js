angular.module("managerApp")
    .directive("cloudProjectRename", function () {
        "use strict";
        return {
            restrict: "E",
            templateUrl: "app/cloud/project/rename/cloud-project-rename.html",
            controller: "CloudProjectRenameController",
            controllerAs: "ctrl",
            bindToController: true,
            scope: {
                projectId: "="
            }
        };
    });
