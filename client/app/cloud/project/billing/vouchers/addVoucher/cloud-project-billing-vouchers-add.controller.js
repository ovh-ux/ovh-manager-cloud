class CloudProjectBillingVoucherAddCtrl {
    constructor ($q, $translate, $uibModalInstance, ControllerHelper, CloudMessage, OvhApiCloudProjectCredit, serviceName) {
        this.$q = $q;
        this.$translate = $translate;
        this.$uibModalInstance = $uibModalInstance;
        this.ControllerHelper = ControllerHelper;
        this.CloudMessage = CloudMessage;
        this.OvhApiCloudProjectCredit = OvhApiCloudProjectCredit;
        this.serviceName = serviceName;

        this.model = {
            value: undefined
        };
    }

    cancel () {
        this.$uibModalInstance.dismiss();
    }

    confirm () {
        if (this.form.$invalid) {
            return this.$q.reject();
        }
        this.CloudMessage.flushChildMessage();
        this.saving = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () =>
                this.OvhApiCloudProjectCredit.v6().save({
                    serviceName: this.serviceName
                }, {
                    code: this.model.value
                }).$promise
                    .then(() => this.CloudMessage.success(this.$translate.instant("cpb_vouchers_add_success")))
                    .catch(err => this.CloudMessage.error(this.$translate.instant("cpb_vouchers_add_error") + (err.data && err.data.message ? " (" + err.data.message + ")" : "")))
                    .finally(() => {
                        this.$uibModalInstance.close();
                    })
        });
        return this.saving.load();
    }
}

angular.module("managerApp").controller("CloudProjectBillingVoucherAddCtrl", CloudProjectBillingVoucherAddCtrl);
