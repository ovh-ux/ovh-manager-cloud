class LogsRolesCtrl {
    constructor ($stateParams, ControllerHelper, LogsRolesService) {
        this.$stateParams = $stateParams;
        this.serviceName = this.$stateParams.serviceName;
        this.ControllerHelper = ControllerHelper;
        this.LogsRolesService = LogsRolesService;
        this.initLoaders();
    }

    initLoaders () {
        this.quota = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () => this.LogsRolesService.getQuota(this.serviceName)
        });

        this.quota.load();
    }
}

angular.module("managerApp").controller("LogsRolesCtrl", LogsRolesCtrl);
