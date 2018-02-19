class LogsRoleOverviewCtrl {
    constructor ($uibModalInstance, role) {
        this.role = role;
        this.$uibModalInstance = $uibModalInstance;
    }

    cancel () {
        this.$uibModalInstance.dismiss();
    }
}

angular.module("managerApp").controller("LogsRoleOverviewCtrl", LogsRoleOverviewCtrl);
