class LogsAccountSetupCtrl {
    constructor ($q, $stateParams, $uibModalInstance, LogsAccountService, ControllerHelper, CloudMessage) {
        this.$q = $q;
        this.$uibModalInstance = $uibModalInstance;
        this.serviceName = this.$stateParams.serviceName;
        this.LogsAccountService = LogsAccountService;
        this.ControllerHelper = ControllerHelper;
        this.CloudMessage = CloudMessage;
    }

    /**
     * update user
     *
     * @memberof LogsAccountSetupCtrl
     */
    updateUser () {
        if (this.form.$invalid) {
            return this.$q.reject();
        }
        this.CloudMessage.flushChildMessage();
        this.saving = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () =>
                this.LogsAccountService.updateUser(this.serviceName, this.user)
                    .finally(() => this.$uibModalInstance.close())
        });
        return this.saving.load();
    }

    cancel () {
        this.$uibModalInstance.dismiss();
    }
}

angular.module("managerApp").controller("LogsAccountSetupCtrl", LogsAccountSetupCtrl);

