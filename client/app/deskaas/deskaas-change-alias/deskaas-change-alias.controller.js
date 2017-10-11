"use strict";

angular.module("managerApp")
    .controller("DeskaasChangeAliasCtrl",
    function ($uibModalInstance) {

        var self = this;

        self.policies = {};

        self.values = {
            newAlias: ""
        };

        self.flags = {
            init : false
        };

        self.cancel = function () {
            $uibModalInstance.dismiss("cancel");
        };

        self.ok = function () {

            if (!self.values.newAlias) {
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
