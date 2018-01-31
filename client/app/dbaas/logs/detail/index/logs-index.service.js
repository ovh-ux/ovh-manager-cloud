class LogsIndexService {
    constructor ($q, OvhApiDbaas, ServiceHelper) {
        this.$q = $q;
        this.ServiceHelper = ServiceHelper;
        this.IndexApiService = OvhApiDbaas.Logs().Index().Lexi();
        this.IndexAapiService = OvhApiDbaas.Logs().Index().Aapi();
        this.AccountingAapiService = OvhApiDbaas.Logs().Accounting().Aapi();
    }

    getQuota (serviceName) {
        return this.AccountingAapiService.me({ serviceName }).$promise
            .then(me => {
                const quota = {
                    max: me.total.maxNbIndex,
                    configured: me.total.curNbIndex,
                    currentUsage: me.total.curNbIndex * 100 / me.total.maxNbIndex
                };
                return quota;
            })
            .catch(this.ServiceHelper.errorHandler("logs_index_quota_get_error"));
    }

    getIndices (serviceName) {
        return this.IndexApiService.get({ serviceName }).$promise
            .then(indices => {
                const promises = indices.map(indexId => this.getIndexDetails(serviceName, indexId));
                return this.$q.all(promises);
            })
            .catch(this.ServiceHelper.errorHandler("logs_index_get_error"));
    }

    getIndexDetails (serviceName, indexId) {
        return this.IndexAapiService.get({ serviceName, indexId }).$promise
            .then(res => { return res; });
    }

    deleteIndex (serviceName, info) {
        return this.ControllerHelper.modal.showModal({
            modalConfig: {
                templateUrl: "app/dbaas/logs/detail/index/delete/logs-index-delete.html",
                controller: "LogsIndexDeleteCtrl",
                controllerAs: "LogsIndexDeleteCtrl",
                resolve: {
                    index: () => info
                }
            }
        });
    }
}

angular.module("managerApp").service("LogsIndexService", LogsIndexService);
