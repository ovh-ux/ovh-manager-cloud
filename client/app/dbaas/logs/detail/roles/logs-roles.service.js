class LogsRolesService {
    constructor ($q, $translate, ControllerHelper, OvhApiDbaas, ServiceHelper) {
        this.$q = $q;
        this.$translate = $translate;
        this.ServiceHelper = ServiceHelper;
        this.ControllerHelper = ControllerHelper;
        // this.LogsOptionsService = LogsOptionsService;
        // this.LogsIndexConstant = LogsIndexConstant;
        // OvhApiDbaasLogsRole
        this.RolesApiService = OvhApiDbaas.Logs().Role().Lexi();
        this.RolesAapiService = OvhApiDbaas.Logs().Role().Aapi();
        this.AccountingAapiService = OvhApiDbaas.Logs().Accounting().Aapi();
    }

    getQuota (serviceName) {
        return this.AccountingAapiService.me({ serviceName }).$promise
            .then(me => {
                const quota = {
                    max: me.total.maxNbRole,
                    configured: me.total.curNbRole,
                    currentUsage: me.total.curNbRole * 100 / me.total.maxNbRole
                };
                return quota;
            }).catch(err => {
                console.log(err);
                this.ServiceHelper.errorHandler("logs_roles_quota_get_error");
            });
    }

    getRoles (serviceName) {
        return this.RolesApiService.query({ serviceName }).$promise
            .then(roles => {
                console.log(roles);
                const promises = roles.map(roleId => this.getRoleDetails(serviceName, roleId));
                return this.$q.all(promises);
            }).catch(err => {
                console.log(err);
            });
    }

    getRoleDetails (serviceName, roleId) {
        console.log("getting role details");
        return this.RolesAapiService.query({ serviceName, roleId }).$promise;
    }
}

angular.module("managerApp").service("LogsRolesService", LogsRolesService);
