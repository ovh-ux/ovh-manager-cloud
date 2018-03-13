"use strict";

angular.module("managerApp")
.config(function ($stateProvider) {
    $stateProvider.state("home", {
        url          : "/",
        templateUrl  : "app/home/home.html",
        controller   : "HomeCtrl",
        controllerAs : "$ctrl",
        translations : ["common", "home", "home/announcement"]
      });
});
