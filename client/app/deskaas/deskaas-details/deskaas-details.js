"use strict";

angular.module("managerApp")
.config(function ($stateProvider) {

    $stateProvider.state("deskaas.details", {
        url          : "/:serviceName?action&token",
        templateUrl  : "app/deskaas/deskaas-details/deskaas-details.html",
        controller   : "DeskaasDetailsCtrl",
        controllerAs : "DeskaasDetailsCtrl",
        translations : ["common", "deskaas", "deskaas/deskaas-details"],
        params: {
            followTask: null
        }
    });

});
