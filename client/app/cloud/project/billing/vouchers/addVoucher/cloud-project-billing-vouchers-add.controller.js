class CloudProjectBillingVoucherAddCtrl {
    constructor ($translate, $uibModalInstance, CloudMessage, OvhApiCloudProjectCredit, serviceName) {
        this.$translate = $translate;
        this.$uibModalInstance = $uibModalInstance;
        this.CloudMessage = CloudMessage;
        this.OvhApiCloudProjectCredit = OvhApiCloudProjectCredit;
        this.serviceName = serviceName;

        this.model = {
            value: undefined
        }
    }

    cancel () {
        this.$uibModalInstance.dismiss();
    }

    confirm () {
        this.saving = true;

        return this.OvhApiCloudProjectCredit.Lexi().save({
                serviceName: this.serviceName
            }, {
                code: this.model.value
            }).$promise
            .then(() => this.CloudMessage.success(this.$translate.instant("cpb_vouchers_add_success")))
            .catch(err => this.CloudMessage.error(this.$translate.instant("cpb_vouchers_add_error") + (err.data && err.data.message ? " (" + err.data.message + ")" : "")))
            .finally(() => {
                this.saving = false;
                this.$uibModalInstance.close()
            });
    }
}

angular.module("managerApp").controller("CloudProjectBillingVoucherAddCtrl", CloudProjectBillingVoucherAddCtrl);
