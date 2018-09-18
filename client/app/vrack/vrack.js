"use strict";

angular.module("managerApp").config(function ($stateProvider) {
    $stateProvider
        .state("vrack", {
            url: "/vrack/:vrackId",
            templateUrl: "app/vrack/vrack.html",
            controller: "VrackCtrl",
            controllerAs: "VrackCtrl",
            translations: ["common", "vrack"],
        })
        .state("vrack-home", {
            url: "/vrack",
            templateUrl: "app/vrack/vrack.html",
            controller: "VrackCtrl",
            controllerAs: "VrackCtrl",
            translations: ["common", "vrack"],
        });
});
