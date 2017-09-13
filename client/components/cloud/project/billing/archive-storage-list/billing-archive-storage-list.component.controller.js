"use strict";

angular.module("managerApp")
    .controller("BillingArchiveStorageListComponentCtrl", function ($q, $filter, $translate, OvhApiMe, Toast) {
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
        }

        function initUserCurrency () {
            return OvhApiMe.Lexi().get().$promise.then(function (me) {
                self.currencySymbol = me.currency.symbol;
            });
        }

        self.getStorageVolumeInfoTooltip = function (storage) {
            return $translate.instant("cpbc_archive_storage_consumption_info_part1")
                .concat($translate.instant("cpbc_archive_storage_consumption_info_part2", {
                    amount: (storage.stored ? storage.stored.quantity.value : 0)
                }));
        };

        self.getStorageOutgoingBandwidthInfoTooltip = function (storage) {
            return $translate.instant("cpbc_archive_storage_output_traffic_info_part1")
                .concat($translate.instant("cpbc_archive_storage_output_traffic_info_part2", {
                    amount: (storage.outgoingBandwidth ? storage.outgoingBandwidth.quantity.value : 0)
                }));
        };

        self.getStorageIncomingBandwidthInfoTooltip = function (storage) {
            return $translate.instant("cpbc_archive_storage_input_traffic_info_part1")
                .concat($translate.instant("cpbc_archive_storage_input_traffic_info_part2", {
                    amount: (storage.incomingBandwidth ? storage.incomingBandwidth.quantity.value : 0)
                }));
        };

    });
