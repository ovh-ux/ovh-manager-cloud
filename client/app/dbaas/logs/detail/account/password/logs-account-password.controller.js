class LogsAccountPasswordCtrl {
    constructor ($q, $stateParams, $uibModalInstance, LogsAccountService, ControllerHelper, CloudMessage) {
        this.$q = $q;
        this.$uibModalInstance = $uibModalInstance;
        this.serviceName = this.$stateParams.serviceName;
        this.LogsAccountService = LogsAccountService;
        this.ControllerHelper = ControllerHelper;
        this.CloudMessage = CloudMessage;
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
                this.LogsAccountService.changePassword(this.serviceName, this.token.data)
                    .finally(() => this.$uibModalInstance.close())
        });
        return this.saving.load();
    }

    cancel () {
        this.$uibModalInstance.dismiss();
    }
}

angular.module("managerApp").controller("LogsAccountPasswordCtrl", LogsAccountPasswordCtrl);

