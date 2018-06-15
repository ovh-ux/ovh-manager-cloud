class CloudProjectBillingVouchersAddcreditCtrl {
    constructor ($uibModalInstance, ControllerHelper, OvhApiMe) {
        this.$uibModalInstance = $uibModalInstance;
        this.ControllerHelper = ControllerHelper;
        this.OvhApiMe = OvhApiMe;
        this.credit = {
            amount: 10
        };

        this.currency = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () => this.OvhApiMe.v6().get().$promise
        });
    }

    $onInit () {
        this.currency.load();
    }

    addCredit () {
        return this.$uibModalInstance.close(this.credit.amount);
    }

    cancel () {
        this.$uibModalInstance.dismiss();
    }

}

angular.module("managerApp").controller("CloudProjectBillingVouchersAddcreditCtrl", CloudProjectBillingVouchersAddcreditCtrl);
