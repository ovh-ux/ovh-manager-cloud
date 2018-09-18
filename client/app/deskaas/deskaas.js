"use strict";

angular.module("managerApp")
.config(function ($stateProvider) {
    $stateProvider.state("deskaas", {
        url          : "/deskaas",
        templateUrl  : "app/deskaas/deskaas.html",
        controller   : "DeskaasCtrl",
        controllerAs : "DeskaasCtrl",
        translations : ["common", "deskaas"],
    });
});
