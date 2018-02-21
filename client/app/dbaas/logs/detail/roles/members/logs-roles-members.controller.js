class LogsRolesMembersCtrl {
    constructor ($stateParams) {
        this.$stateParams = $stateParams;
        this.serviceName = this.$stateParams.serviceName;
        console.log(this.serviceName);
    }
}

angular.module("managerApp").controller("LogsRolesMembersCtrl", LogsRolesMembersCtrl);
