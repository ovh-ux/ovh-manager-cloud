"use strict";

angular.module("managerApp").controller("CloudProjectComputeInfrastructureVirtualmachineMonthlyConfirm", function ($uibModalInstance, params, $translate, CloudMessage, CloudProjectComputeInfrastructureOrchestrator) {

    var self = this;

    self.vmInEdition = params;

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

});
