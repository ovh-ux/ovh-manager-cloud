class LogsDashboardService {
    constructor ($q, OvhApiDbaas, ServiceHelper) {
        this.$q = $q;
        this.OvhApiDbaasLogsDashboard = OvhApiDbaas.Logs().Dashboard().Lexi();
        this.OvhAapiDbaasLogsDashboard = OvhApiDbaas.Logs().Dashboard().Aapi();
        this.ServiceHelper = ServiceHelper;
    }

    getAllDashboards (serviceName) {
        return this.OvhApiDbaasLogsDashboard.query({ serviceName }).$promise
            .then(dashboards => {
                const promises = dashboards.map(dashboardId => this.getDashboardDetails(serviceName, dashboardId));
                return this.$q.all(promises);
            });
    }

    getDashboardDetails (serviceName, dashboardId) {
        return this.OvhAapiDbaasLogsDashboard.get({ serviceName, dashboardId }).$promise;
    }
}

angular.module("managerApp").service("LogsDashboardService", LogsDashboardService);
