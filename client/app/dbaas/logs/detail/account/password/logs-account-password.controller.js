class LogsAccountPasswordCtrl {
    constructor ($q, $stateParams, $uibModalInstance, ControllerHelper, CloudMessage, LogsAccountService) {
        this.$q = $q;
        this.$stateParams = $stateParams;
        this.$uibModalInstance = $uibModalInstance;
        this.serviceName = this.$stateParams.serviceName;
        this.ControllerHelper = ControllerHelper;
        this.CloudMessage = CloudMessage;
        this.LogsAccountService = LogsAccountService;
    }

    /**
     * change password
     *
     * @memberof LogsAccountPasswordCtrl
     */
    changePassword () {
        if (this.form.$invalid) {
            return this.$q.reject();
        }
        this.CloudMessage.flushChildMessage();
        this.saving = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () =>
                this.LogsAccountService.changePassword(this.serviceName, this.newPassword)
                    .finally(() => this.$uibModalInstance.close())
        });
        return this.saving.load();
    }

    cancel () {
        this.$uibModalInstance.dismiss();
    }
}

angular.module("managerApp").controller("LogsAccountPasswordCtrl", LogsAccountPasswordCtrl);

