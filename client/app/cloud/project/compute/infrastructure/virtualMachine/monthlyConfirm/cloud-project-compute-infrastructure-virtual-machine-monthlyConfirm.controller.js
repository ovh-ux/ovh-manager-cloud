"use strict";

angular.module("managerApp").controller("CloudProjectComputeInfrastructureVirtualmachineMonthlyConfirm", function ($uibModalInstance, params, $translate, CloudMessage, CloudProjectComputeInfrastructureOrchestrator, TARGET, URLS) {

    var self = this;

    self.vmInEdition = params;
    self.TARGET = TARGET;
    self.expressOrderUrl = null;

    self.loaders = {
        saveVm : false
    };

    this.cancel = function () {
        $uibModalInstance.dismiss();
    };

    this.confirm = function () {
        self.vmInEdition.initEdition();
        self.vmInEdition.monthlyBillingBoolean = true;
        self.loaders.saveVm = true;
        CloudProjectComputeInfrastructureOrchestrator.saveEditedVm(self.vmInEdition).then(function () {
            CloudMessage.success($translate.instant("cpcivm_monthly_success"));
        }, function (err) {
            CloudMessage.error( [$translate.instant("cpcivm_monthly_fail"), err.data && err.data.message || ''].join(' '));
        })["finally"](function () {
            self.loaders.saveVm = false;
            $uibModalInstance.dismiss();
        });
    };

    self.$onInit = function () {
        if (self.TARGET === "US") {
            const expressOrderPayload = {
                productId: "cloud",
                serviceName: self.vmInEdition.serviceName,
                planCode: self.vmInEdition.flavor.planCodes.monthly,
                duration: "P1M",
                pricingMode: "default",
                quantity: 1,
                configuration: [{
                    label: "instanceId",
                    values: [self.vmInEdition.id]
                }]
            };
            self.expressOrderUrl = `${URLS.website_order.express.US}review?products=${JSURL.stringify([expressOrderPayload])}`;
        }
    }

});
