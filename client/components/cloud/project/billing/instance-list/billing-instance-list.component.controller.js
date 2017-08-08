"use strict";

angular.module("managerApp")
  .controller("BillingInstanceListComponentCtrl", function ($stateParams, $q, $translate, CloudProjectImage, DetailsPopoverService, CloudProjectInstance, Toast, User, CloudPrice) {
        var self = this;
        self.windowsStringPattern = "/^win-/";
        self.instanceConsumptionDetails = [];

        self.data = {
            instances: [],
            images: [],
            instanceToMonthlyPrice: null
        };

        self.loaders = {
            monthlyBilling: false,
            instanceList: false
        };

        self.DetailsPopoverService = DetailsPopoverService;
        self.currencySymbol = "";

        self.instanceToMonthly = null;

        self.$onInit = () => {
            self.loaders.instanceList = true;

            $q.all([initInstances(), initImages(), initUserCurrency()]).then(function () {
                loadConsumptionDetails();
            })
            .catch(function (err) {
                Toast.error([$translate.instant("cpb_error_message"), err.data && err.data.message || ""].join(" "));
                return $q.reject(err);
            })
            .finally(function () {
                self.loaders.instanceList = false;
            });
        };

        function initInstances () {
            return CloudProjectInstance.Lexi().query({
                serviceName: $stateParams.projectId
            }).$promise.then(function (instances) {
                self.data.instances = instances;
            });
        }

        function initImages () {
            return CloudProjectImage.Lexi().query({
                serviceName: $stateParams.projectId
            }).$promise.then(function (result) {
                self.data.images = result;
            });
        }

        function initUserCurrency () {
            return User.Lexi().get().$promise.then(function (me) {
                self.currencySymbol = me.currency.symbol;
            });
        }

        function loadConsumptionDetails () {
            self.instanceConsumptionDetailsInit = _.map(self.instances, function (billingDetail) { return getInstanceConsumptionDetails(billingDetail); });

            $q.allSettled(self.instanceConsumptionDetailsInit).then(function (instances) {
                self.instanceConsumptionDetails = instances;
            });
        }

        function getInstanceConsumptionDetails (billingDetail) {
            var instanceConsumptionDetail = {};
            instanceConsumptionDetail.instanceId = billingDetail.instanceId;
            instanceConsumptionDetail.instanceName = billingDetail.instanceId;
            instanceConsumptionDetail.total = billingDetail.totalPrice.toFixed(2) + " " + self.currencySymbol;
            instanceConsumptionDetail.region = billingDetail.region;
            instanceConsumptionDetail.reference = billingDetail.reference;
            instanceConsumptionDetail.imageType = getImageTypeFromReference(billingDetail.reference);
            instanceConsumptionDetail.vmType =  billingDetail.reference ? billingDetail.reference.replace(self.windowsStringPattern, "").toUpperCase() : "";

            var instance = _.find(self.data.instances, { id: billingDetail.instanceId });
            if (instance) {
                instanceConsumptionDetail.isDeleted = false;
                instanceConsumptionDetail.instanceName = instance.name;
                instanceConsumptionDetail.monthlyBilling = instance.monthlyBilling;

                var imageData = _.find(self.data.images, { id: instance.imageId });
                if (imageData) {
                    instanceConsumptionDetail.imageType = imageData.type;
                }
            } else {
                instanceConsumptionDetail.isDeleted = true;
            }

            return instanceConsumptionDetail;
        }

        function getImageTypeFromReference (reference) {
            if (reference) {
                return /^win/.test(reference) ? "windows" : "linux";
            } else {
                return "";
            }
        }

        self.prepareMonthlyPaymentActivation = function (instance) {
            self.instanceToMonthly = instance.instanceId;
            self.data.instanceToMonthlyPrice = null;
            self.loaders.monthlyBilling = true;

            CloudPrice.Lexi().query().$promise.then(function (prices) {
                if (prices.instances && prices.instances.length) {
                    self.data.instanceToMonthlyPrice = _.find(prices.instances, {flavorName : instance.reference});
                }
                if (!self.data.instanceToMonthlyPrice) {
                    self.endInstanceToMonthlyConversion();
                    return $q.reject({ data: { message: "No instances for flavor." } });
                }
            }).catch(function (err) {
                self.instanceToMonthly = null;
                Toast.error([$translate.instant("cpbc_hourly_instance_pass_to_monthly_price_error"), err.data && err.data.message || ""].join(" "));
                return $q.reject(err);
            }).finally(function () {
                self.loaders.monthlyBilling = false;
            });
        };

        self.confirmMonthlyPaymentActivation = function () {
            self.loaders.monthlyBilling = true;

            CloudProjectInstance.Lexi().activeMonthlyBilling({
                serviceName: $stateParams.projectId,
                instanceId: self.instanceToMonthly
            }).$promise.then(function () {
                init();
                // reset loaders and instance to activate
                self.endInstanceToMonthlyConversion();
            }).catch(function (err) {
                Toast.error([$translate.instant("cpbc_hourly_instance_pass_to_monthly_error"), err.data && err.data.message || ""].join(" "));
                return $q.reject(err);
            }).finally(function () {
                self.loaders.monthlyBilling = false;
            });
        };

        self.endInstanceToMonthlyConversion = function () {
            self.instanceToMonthly = null;
        }
    }
);
