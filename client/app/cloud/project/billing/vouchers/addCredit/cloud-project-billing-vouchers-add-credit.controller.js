"use strict";

angular.module("managerApp")
  .controller("CloudProjectBillingVouchersAddcreditCtrl",
    function ($uibModalInstance, OvhApiOrderCloudProjectCredit, $stateParams, CloudMessage, $translate, $window, OvhApiMe) {

        var self = this;

        self.loaders = {
            addCredit: false,
            currency: false
        };

        self.credit = {
            amount: 10,
            currencyCodeText: ""
        };

        function getCurrency () {
            self.loaders.currency = true;
            OvhApiMe.v6().get().$promise.then(function (me) {
                self.credit.currencyCodeText = me.currency.symbol;
            })["finally"](function () {
                self.loaders.currency = false;
            });
        }

        self.addCredit = function () {
            self.loaders.addCredit = true;
            OvhApiOrderCloudProjectCredit.v6().save({
                serviceName: $stateParams.projectId
            }, {
                amount: self.credit.amount
            }).$promise.then(function (result) {
                $window.open(result.url, "_blank");
                CloudMessage.success($translate.instant("cpb_vouchers_add_credit_success", { amount: result.prices.withoutTax.text, url: result.url }), { hideAfter: 10 });
                $uibModalInstance.close();
            }, function (err) {
                CloudMessage.error([$translate.instant("cpb_vouchers_add_credit_error"), err.data && err.data.message || ""].join(" "));
            })["finally"](function () {
                self.loaders.addCredit = false;
            });
        };

        self.cancel = function () {
            $uibModalInstance.dismiss();
        };

        getCurrency();
    }
);
