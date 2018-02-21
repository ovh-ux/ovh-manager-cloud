class LogsRolesAddMembersCtrl {
    constructor ($stateParams, $uibModalInstance, logs) {
        this.$stateParams = $stateParams;
        this.serviceName = this.$stateParams.serviceName;
        this.$uibModalInstance = $uibModalInstance;
        this.logs = logs;
        this.member = {
            name: ""
        };
        console.log(this.logs);
    }

    cancel () {
        this.$uibModalInstance.dismiss();
    }

}

angular.module("managerApp").controller("LogsRolesAddMembersCtrl", LogsRolesAddMembersCtrl);
