"use strict";

angular.module("managerApp")
  .config(function ($stateProvider) {
        $stateProvider
            .state("paas.nasha", {
                url: "/nasha/:nashaId",
                templateUrl: "app/nasha/nasha.html",
                controller: "NashaCtrl",
                controllerAs: "NashaCtrl",
                abstract: true,
                translations: ["common", "nasha"]
            });
    });
