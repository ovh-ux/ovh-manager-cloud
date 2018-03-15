class LogsHomeFormatsportsCtrl {
    constructor ($uibModalInstance, accountDetails, LogsHomeConstant) {
        this.accountDetails = accountDetails;
        this.$uibModalInstance = $uibModalInstance;
        this.LogsHomeConstant = LogsHomeConstant;
    }

    /**
     * Closes the info pop-up
     *
     * @memberof LogsHomeFormatsportsCtrl
     */
    cancel () {
        this.$uibModalInstance.dismiss();
    }
}

angular.module("managerApp").controller("LogsHomeFormatsportsCtrl", LogsHomeFormatsportsCtrl);
