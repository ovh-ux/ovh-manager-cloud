"use strict";

angular.module("managerApp").controller("VrackAddCtrl",
    function ($q, $translate, $state, $rootScope, CloudMessage, OvhApiOrder) {

        var self = this;

        this.loaders = {
            loading: false,
            validationPending: false
        };

        this.model = {
            agreements: [],
            contractsAccepted: false,
            purchaseOrderUrl: ""
        };

        this.getVrackContract = function () {
            return OvhApiOrder.Vrack().New().v6().get({
                quantity: 1
            }).$promise.then(function (data) {
                self.model.agreements = data.contracts;
            }).catch(function (error) {
                CloudMessage.error($translate.instant("vrack_error_reason", { message: error.data.message }));
            });
        };

        this.addVrack = function () {
            self.loaders.loading = true;
            return OvhApiOrder.Vrack().New().v6().create({
                quantity: this.model.quantityToOrder
            }, {}).$promise.then(function (data) {
                CloudMessage.success($translate.instant("vrack_adding_success", { data: _.pick(data, ["url", "orderId"]) }));
                self.model.purchaseOrderUrl = data.url;
                self.loaders.validationPending = true;
            }).catch(function (error) {
                CloudMessage.error($translate.instant("vrack_error_reason", { message: error.data.message }));
            }).finally(function () {
                self.loaders.loading = false;
            });
        };

        function init () {
            self.loaders.loading = true;
            self.getVrackContract()
            .finally(function () {
                self.loaders.loading = false;
            });
        }

        init();
    });
