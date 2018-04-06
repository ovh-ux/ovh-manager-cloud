class LogsAccountPasswordCtrl {
    constructor ($q, $state, $stateParams, $uibModalInstance, ControllerHelper, CloudMessage, LogsAccountService) {
        this.$q = $q;
        this.$stateParams = $stateParams;
        this.$uibModalInstance = $uibModalInstance;
        this.serviceName = this.$stateParams.serviceName;
        this.ControllerHelper = ControllerHelper;
        this.CloudMessage = CloudMessage;
        this.LogsAccountService = LogsAccountService;
        this.passwordValid = false;
        this.passwordRules = this.LogsAccountService.getPasswordRules(false);
    }

    resetPasswordRules () {
        this.passwordRules = this.LogsAccountService.getPasswordRules(true);
    }

    validatePassword () {
        let allValid = true;
        _.each(this.passwordRules, rule => {
            rule.isValid = rule.validator(this.newPassword);
            if (allValid) {
                allValid = rule.isValid;
            }
            rule.isValidated = true;
        });
        this.passwordValid = allValid;
    }
    /**
     * change password
     *
     * @memberof LogsAccountPasswordCtrl
     */
    changePassword () {
        if (this.form.$invalid || !this.passwordValid) {
            return this.$q.reject();
        }
        this.CloudMessage.flushChildMessage();
        this.saving = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () =>
                this.LogsAccountService.changePassword(this.serviceName, this.newPassword, false)
                    .finally(() => {
                        this.resetPasswordRules();
                        this.$uibModalInstance.close();
                    })
        });
        return this.saving.load();
    }

    cancel () {
        this.resetPasswordRules();
        this.$uibModalInstance.dismiss();
    }
}

angular.module("managerApp").controller("LogsAccountPasswordCtrl", LogsAccountPasswordCtrl);

