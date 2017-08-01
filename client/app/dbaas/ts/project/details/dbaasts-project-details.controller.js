"use strict";

angular.module("managerApp").controller("DBaasTsProjectDetailsCtrl", function ($state) {
    var self = this;

    self.getRouteContext = function () {

        if ($state.includes("dbaas.dbaasts-project")) {
            return "dbaas.dbaasts-project.dbaasts-project-details";
        }

        return "";
    };

});
