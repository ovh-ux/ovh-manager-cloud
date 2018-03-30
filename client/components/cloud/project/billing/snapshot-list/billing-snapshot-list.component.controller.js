"use strict";

angular.module("managerApp")
    .controller("BillingSnapshotListComponentCtrl", function ($q, $translate, $filter, OvhApiMe, Toast, RegionService) {
        var self = this;

        self.RegionService = RegionService;

        self.currencySymbol = "";

        self.loading = false;

        self.$onInit = () => {
            self.loading = true;

            $q.all([initUserCurrency()])
                .catch(function (err) {
                    Toast.error([$translate.instant("cpb_error_message"), err.data && err.data.message || ""].join(" "));
                    return $q.reject(err);
                })
                .finally(function () {
                    self.loading = false;
                });
        };

        function initUserCurrency () {
            return OvhApiMe.v6().get().$promise.then(function (me) {
                self.currencySymbol = me.currency.symbol;
            });
        }

        self.getSnapshotPriceInfoTooltip = function (snapshot) {
            return $translate.instant("cpbc_snapshot_col_usage_info_part1")
                .concat($translate.instant("cpbc_snapshot_col_usage_info_part2", {
                    amount: snapshot.instance.quantity.value
                }));
        };

    });
