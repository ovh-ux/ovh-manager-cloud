"use strict";

angular.module("managerApp")
    .controller("DeskaasConfirmTerminateCtrl",
    function ($scope, $location, $uibModalInstance, token) {

        var self = this;

        self.values = {
            token: token,
            reason: "",
            commentary: "",
        };

        self.flags = {
            init : false
        };

        function removeConfirmationParams () {
            if ($location.$$search.action) {
                delete $location.$$search.action;
            }
            if ($location.$$search.token) {
                delete $location.$$search.token;
            }
            // Do not reload url
            $location.$$compose();
        }

        self.cancel = function () {
            // clear params needed to display confirmation
            removeConfirmationParams();
            // Remove popup
            $uibModalInstance.dismiss("cancel");
        };

        self.ok = function () {
            // clear params needed to display confirmation
            removeConfirmationParams();
            if (!self.values.token && !self.values.reason) {
                $uibModalInstance.dismiss("cancel");
                return;
            }

            $uibModalInstance.close(self.values);
        };

        function init () {
            self.flags.init = false;

        }

        init();

    });
