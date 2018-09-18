"use strict";

angular.module("managerApp")
.config(function ($stateProvider) {
    $stateProvider
        .state("vrack-add", {
            url: "/vrack/new",
            templateUrl: "app/vrack/add/vrack-add.html",
            controller: "VrackAddCtrl",
            controllerAs: "VrackAddCtrl",
            translations: ["common", "vrack", "vrack/add"],
        });
});
