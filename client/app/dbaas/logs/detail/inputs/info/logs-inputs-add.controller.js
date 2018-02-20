class LogsInputsAddCtrl {
    constructor ($stateParams) {
        this.$stateParams = $stateParams;
        this.serviceName = this.$stateParams.serviceName;
    }
}

angular.module("managerApp").controller("LogsInputsAddCtrl", LogsInputsAddCtrl);
