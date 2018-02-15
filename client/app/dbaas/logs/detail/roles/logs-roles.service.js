class LogsRolesService {
    constructor ($q, $translate, ControllerHelper, OvhApiDbaas, ServiceHelper) {
        this.$q = $q;
        this.$translate = $translate;
        this.ServiceHelper = ServiceHelper;
        this.ControllerHelper = ControllerHelper;
        // this.LogsOptionsService = LogsOptionsService;
        // this.LogsIndexConstant = LogsIndexConstant;
        this.IndexApiService = OvhApiDbaas.Logs().Index().Lexi();
        this.IndexAapiService = OvhApiDbaas.Logs().Index().Aapi();
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
}

angular.module("managerApp").service("LogsRolesService", LogsRolesService);
