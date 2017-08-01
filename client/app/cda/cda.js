angular.module("managerApp")
    .config(function ($stateProvider) {
        "use strict";
        $stateProvider
            .state("paas.cda", {
                url: "/cda",
                templateUrl: "app/cda/cda.html",
                controller: "CdaCtrl",
                controllerAs: "CdaCtrl",
                translations: ["common"],
                abstract: true
            });
    });
