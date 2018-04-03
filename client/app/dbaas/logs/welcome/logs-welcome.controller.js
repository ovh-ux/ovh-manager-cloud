class LogsWelcomeCtrl {
    constructor ($state, LogsConstants, ovhDocUrl) {
        this.$state = $state;
        this.LogsConstants = LogsConstants;
        this.ovhDocUrl = ovhDocUrl;
    }

    $onInit () {
        this.docsUrl = this.ovhDocUrl.getDocUrl(this.LogsConstants.LOGS_DOCS_NAME);
    }
}

angular.module("managerApp").controller("LogsWelcomeCtrl", LogsWelcomeCtrl);
