"use strict";

angular.module("managerApp")
    .config(function ($stateProvider) {
        $stateProvider.state("deskaas.details.upgrade", {
            url          : "/upgrade",
            templateUrl  : "app/deskaas/deskaas-upgrade/deskaas-upgrade.html",
            controller   : "DeskaasUpgradeCtrl",
            controllerAs : "DeskaasUpgradeCtrl",
            translations : ["common", "deskaas"]
        });
    });
