angular.module("managerApp").controller("NashaOrderCompleteCtrl", function ($stateParams) {
    "use strict";
    var self = this;

    function init () {
        self.orderUrl = $stateParams.orderUrl;
    }

    init();
});