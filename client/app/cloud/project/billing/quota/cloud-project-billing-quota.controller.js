"use strict";

angular.module("managerApp").controller("CloudProjectBillingQuotaCtrl",
    function ($q, $stateParams, $translate, REDIRECT_URLS, CloudProject, CloudProjectQuota, UserPaymentMean, Toast, OtrsPopupService, RegionService) {

        //---------VARIABLE DECLARATION---------

        var self = this;
        var serviceName = $stateParams.projectId;

        this.loader = {
            quota: false,
            unleash: false
        };

        this.datas = {
            quota: null,
            defaultPaymentMean: null
        };

        this.state = {
            isRestrictedQuota: false
        };

        // PaymentMean URL (v6 dedicated) with sessionv6
        this.paymentmeanUrl = REDIRECT_URLS.paymentMeans;

        self.regionService = RegionService;

        //---------SUPPORT---------

        this.openSupport = function () {
            if (!OtrsPopupService.isLoaded()) {
                OtrsPopupService.init();
            } else {
                OtrsPopupService.toggle();
            }
        };

        //---------UNLEASH---------

        this.unleashAccount = function () {
            self.loader.unleash = true;

            return CloudProject.Lexi().unleash({
                serviceName: serviceName
            }, {}).$promise.then(function () {
                init();
            }, function (err) {
                if (err.status === 403) {
                    Toast.error($translate.instant("cpb_quota_already_unleashed"));
                } else {
                    Toast.error($translate.instant("cpb_quota_unleash_error"));
                }
                init();
            })["finally"](function () {
                self.loader.unleash = false;
            });
        };

        //---------INITIALIZATION---------

        function init () {
            var initQueue = [];

            self.loader.quota = true;
            self.loader.unleash = false;

            // check default payment mean
            initQueue.push(UserPaymentMean.Lexi().getDefaultPaymentMean().then(function (defaultPaymentMean) {
                self.datas.defaultPaymentMean = defaultPaymentMean;
            }));

            // get quota
            initQueue.push(CloudProjectQuota.Lexi().query({
                serviceName: serviceName
            }).$promise.then(function (quotas) {
                self.datas.quota = quotas;
            }));

            return $q.all(initQueue).then(function () {
                // check if quota is restricted
                if (self.datas.quota.length) {
                    self.state.isRestrictedQuota = self.datas.quota[0].maxInstances === 1 && self.datas.quota[0].maxCores === 1 && self.datas.quota[0].maxRam === 2048;
                }
            }, function (err) {
                Toast.error([$translate.instant("cpb_quota_loading_error"), err.data && err.data.message || ""].join(" "));
                self.datas.quota = null;
            })["finally"](function () {
                self.loader.quota = false;
            });
        }

        init();
    }
);
