"use strict";

angular.module("managerApp").controller("CloudProjectBillingConsumptionEstimateAlertAddCtrl",
    function ($uibModalInstance, $stateParams, $scope, $translate, $q, User, CloudProjectAlerting, Toast, dataContext) {
        var self = this;

        self.model = {
            email: "",
            threshold: null
        };

        self.alerting = {
            email: "",
            threshold: 0,
            currency: "",
            defaultDelay: 3600 // user cannot choose one so we use a default value
        };

        self.loaders = {
            saveAlert: false,
        };

        function init () {
            initAlert();
            initCurrency();
        }

        function initCurrency () {
            self.alerting.currency = dataContext.currencySymbol;
        }

        function initAlert () {
            if (dataContext.alert) {
                self.model.email = dataContext.alert.email;
                self.model.threshold = dataContext.alert.monthlyThreshold;
                self.alerting.id = dataContext.alert.id;
                self.alerting.email = self.model.email;
                self.alerting.threshold = self.model.threshold;
            } else {
                self.alerting.id = null;
                self.model.email = self.alerting.email = "";
                self.model.threshold = self.alerting.threshold = null;
            }
        }

        self.saveAlert = function () {
            this.loaders.saveAlert = true;
            (!self.alerting.id ? createAlert() : editAlert(self.alerting.id))
            .catch(function (err) {
                Toast.error([$translate.instant("cpbea_estimate_alert_error"), err.data && err.data.message || ""].join(" "));
            }).finally(function () {
                $uibModalInstance.close();
                self.loaders.saveAlert  = false;
            });
        };

        function createAlert () {
            return CloudProjectAlerting.Lexi().save({
                serviceName: $stateParams.projectId
            }, {
                delay: self.alerting.defaultDelay,
                email: self.model.email,
                monthlyThreshold: self.model.threshold
            }).$promise.then(function () {
                Toast.success($translate.instant("cpbea_estimate_alert_success"));
            });
        }

        function editAlert (alertId) {
            return CloudProjectAlerting.Lexi().put({
                serviceName: $stateParams.projectId,
                alertId: alertId
            }, {
                delay: self.alerting.defaultDelay,
                email: self.model.email,
                monthlyThreshold: self.model.threshold
            }).$promise.then(function () {
                $uibModalInstance.close();
                Toast.success($translate.instant("cpbea_estimate_alert_success"));
            });
        }

        self.closeModal = function () {
            $uibModalInstance.dismiss();
        };

        init();
    }
);
