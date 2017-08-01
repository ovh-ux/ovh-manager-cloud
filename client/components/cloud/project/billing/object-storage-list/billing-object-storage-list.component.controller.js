"use strict";

angular.module("managerApp")
    .controller("BillingObjectStorageListComponentCtrl", function ($q, $filter, $translate, User, Toast) {
        var self = this;

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
            return User.Lexi().get().$promise.then(function (me) {
                self.currencySymbol = me.currency.symbol;
            });
        }

        self.getStorageVolumeInfoTooltip = function (storage) {
            return $translate.instant("cpbc_object_storage_consumption_info_part1")
                .concat($translate.instant("cpbc_object_storage_consumption_info_part2", {
                    amount: (storage.stored ? storage.stored.quantity.value : 0)
                }));
        };

        self.getStorageBandwidthInfoTooltip = function (storage) {
            return $translate.instant("cpbc_object_storage_output_traffic_info_part1")
                .concat($translate.instant("cpbc_object_storage_output_traffic_info_part2", {
                    amount: storage.outgoingBandwidth.quantity.value
                }));
        };

    });
