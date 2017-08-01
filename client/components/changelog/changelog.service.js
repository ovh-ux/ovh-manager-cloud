angular.module("managerApp")
.service("ChangelogService", function ($uibModal) {
    "use strict";

    this.show = function () {
        $uibModal.open({
            templateUrl: "components/changelog/changelog.html",
            controller: "ChangelogCtrl",
            controllerAs: "ChangelogCtrl"
        });
    };

});
