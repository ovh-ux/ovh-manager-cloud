class LogsIndexService {
    constructor ($q, $translate, ControllerHelper, OvhApiDbaas, ServiceHelper, LogsOptionsService) {
        this.$q = $q;
        this.$translate = $translate;
        this.ServiceHelper = ServiceHelper;
        this.ControllerHelper = ControllerHelper;
        this.LogsOptionsService = LogsOptionsService;
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
            }).catch(this.ServiceHelper.errorHandler("logs_streams_quota_get_error"));
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
            .then(res => res);
    }

    deleteModal (info) {
        return this.ControllerHelper.modal.showDeleteModal({
            titleText: this.$translate.instant("logs_modal_delete_title"),
            text: this.$translate.instant("logs_modal_delete_question", { index: info.name })
        });
    }

    deleteIndex (serviceName, indexId) {
        return this.IndexApiService.delete({ serviceName, indexId }).$promise
            .catch(this.ServiceHelper.errorHandler("logs_index_delete_error"));
    }

    addModal (serviceName, indexInfo) {
        return this.ControllerHelper.modal.showModal({
            modalConfig: {
                templateUrl: "app/dbaas/logs/detail/index/add/logs-index-add.html",
                controller: "LogsIndexAddModalCtrl",
                controllerAs: "LogsIndexAddModalCtrl",
                resolve: {
                    serviceName: () => serviceName,
                    indexInfo: () => indexInfo
                }
            }
        });
    }

    getSubscribedOptions (serviceName) {
        return this.LogsOptionsService.getStreamSubscribedOptions(serviceName, "index");
    }

    updateIndex (serviceName, indexId, indexInfo) {
        this.IndexApiService.put({ serviceName, indexId }, indexInfo).$promise
            .catch(this.ServiceHelper.errorHandler("logs_index_edit_error"));
    }

    createIndex (serviceName, object) {
        this.IndexApiService.post({ serviceName }, object).$promise
            .catch(this.ServiceHelper.errorHandler("logs_index_create_error"));
    }
}

angular.module("managerApp").service("LogsIndexService", LogsIndexService);
