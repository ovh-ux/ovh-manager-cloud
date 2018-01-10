class LogsAliasesLinkCtrl {
    constructor ($stateParams) {
        this.$stateParams = $stateParams;
        this.serviceName = this.$stateParams.serviceName;
        this.alias = this.$stateParams.aliasId;
    }
}

angular.module("managerApp").controller("LogsAliasesLinkCtrl", LogsAliasesLinkCtrl);
