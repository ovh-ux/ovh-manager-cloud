"use strict";

angular.module("managerApp")
    .controller("DeskaasUpgradeCtrl",
    function ($scope, $uibModalInstance, service, upgrades, $translate, $q) {
        var self = this;

        self.ref = null;
        self.service = service;
        self.prices = null;

        self.references = upgrades;

        self.flags = {
            init : false
        };

        self.cancel = function () {
            $uibModalInstance.dismiss("cancel");
            return {};
        };

        //--------------- Upgrade process
        self.upgradeConfirmMessage = function (ref) {
            return $translate.instant("vdi_confirm_upgrade", { plan: ref.name, price: ref.priceText });
        };

        self.upgrade = function (ref) {
            if (!ref) {
                return $q.when();
            }
            $uibModalInstance.close({ "planCode": ref.planCode });
            return;
        };

        //--------------- Init
        function init () {
            self.flags.init = false;
        }

        init();

    });
