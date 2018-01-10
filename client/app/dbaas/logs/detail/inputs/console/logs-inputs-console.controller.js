class LogsInputsConsoleCtrl {
    constructor ($stateParams) {
        this.$stateParams = $stateParams;
        this.serviceName = this.$stateParams.serviceName;
        this.input = this.$stateParams.inputId;
    }
}

angular.module("managerApp").controller("LogsInputsConsoleCtrl", LogsInputsConsoleCtrl);
