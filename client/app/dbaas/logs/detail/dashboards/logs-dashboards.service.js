class LogsDashboardService {
    constructor (OvhApiDbaas, ServiceHelper) {
        this.OvhApiDbaasLogsDashboard = OvhApiDbaas.Logs().Dashboard().Lexi();
        this.ServiceHelper = ServiceHelper;
    }

    getDashboards (serviceName) {
        return this.OvhApiDbaasLogsDashboard.query({ serviceName }).$promise;
    }
}

angular.module("managerApp").service("LogsDashboardService", LogsDashboardService);
