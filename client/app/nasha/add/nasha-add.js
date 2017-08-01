"use strict";

angular.module("managerApp")
.config(function ($stateProvider) {
    $stateProvider
    .state("paas.nasha-add", {
        url: "/nasha/new",
        templateUrl: "app/nasha/add/nasha-add.html",
        controller: "NashaAddCtrl",
        controllerAs: "NashaAddCtrl",
        translations: ["common", "nasha", "nasha/add"]
    });
});
