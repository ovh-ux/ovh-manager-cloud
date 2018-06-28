"use strict";

angular.module("managerApp").controller("CloudProjectComputeQuotaCtrl",
    function ($q, $stateParams, $translate, REDIRECT_URLS, OvhApiCloudProject, OvhApiCloudProjectQuota, OvhApiMePaymentMean, CloudMessage, OtrsPopupService, RegionService, TARGET) {

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
        this.supportUrl = REDIRECT_URLS.support;

        self.regionService = RegionService;

        this.TARGET = TARGET;

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

            return OvhApiCloudProject.v6().unleash({
                serviceName: serviceName
            }, {}).$promise.then(function () {
                init();
            }, function (err) {
                if (err.status === 403) {
                    CloudMessage.error($translate.instant("cpb_quota_already_unleashed"));
                } else {
                    CloudMessage.error($translate.instant("cpb_quota_unleash_error"));
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
            initQueue.push(OvhApiMePaymentMean.v6().getDefaultPaymentMean().then(function (defaultPaymentMean) {
                self.datas.defaultPaymentMean = defaultPaymentMean;
            }));

            // get quota
            initQueue.push(OvhApiCloudProjectQuota.v6().query({
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
                CloudMessage.error([$translate.instant("cpb_quota_loading_error"), err.data && err.data.message || ""].join(" "));
                self.datas.quota = null;
            })["finally"](function () {
                self.loader.quota = false;
            });
        }

        init();
    }
);
