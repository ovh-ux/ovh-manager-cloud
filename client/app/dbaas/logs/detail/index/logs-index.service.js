class LogsIndexService {
    constructor ($q, $translate, CloudPoll, ControllerHelper, LogsHelperService, OvhApiDbaas, ServiceHelper, LogsOptionsService, LogsConstants) {
        this.$q = $q;
        this.$translate = $translate;
        this.CloudPoll = CloudPoll;
        this.ServiceHelper = ServiceHelper;
        this.ControllerHelper = ControllerHelper;
        this.LogsHelperService = LogsHelperService;
        this.LogsOptionsService = LogsOptionsService;
        this.LogsConstants = LogsConstants;
        this.IndexApiService = OvhApiDbaas.Logs().Index().v6();
        this.IndexAapiService = OvhApiDbaas.Logs().Index().Aapi();
        this.AccountingAapiService = OvhApiDbaas.Logs().Accounting().Aapi();
        this.OperationApiService = OvhApiDbaas.Logs().Operation().v6();
        this.newIndex = {
            description: "",
            alertNotifyEnabled: false
        };
    }

    getNewIndex () {
        return this.newIndex;
    }

    getQuota (serviceName) {
        return this.AccountingAapiService.me({ serviceName }).$promise
            .then(me => {
                const quota = {
                    max: me.total.maxNbIndex,
                    configured: me.total.curNbIndex,
                    currentUsage: me.total.curNbIndex * 100 / me.total.maxNbIndex,
                    mainOfferMax: me.offer.maxNbIndex,
                    mainOfferCurrent: me.offer.curNbIndex
                };
                return quota;
            })
            .catch(err => this.LogsHelperService.handleError("logs_streams_quota_get_error", err, {}));
    }

    getIndices (serviceName) {
        return this.IndexApiService.query({ serviceName }).$promise
            .then(indices => {
                const promises = indices.map(indexId => this.getIndexDetails(serviceName, indexId));
                return this.$q.all(promises);
            })
            .catch(err => this.LogsHelperService.handleError("logs_index_get_error", err, {}));
    }

    getOwnIndices (serviceName) {
        return this.getIndices(serviceName)
            .then(indices => indices.filter(index => index.info.isEditable))
            .catch(err => this.LogsHelperService.handleError("logs_index_get_error", err, {}));
    }

    getShareableIndices (serviceName) {
        return this.getIndices(serviceName)
            .then(indices => indices.filter(index => index.info.isShareable))
            .catch(err => this.LogsHelperService.handleError("logs_index_get_error", err, {}));
    }

    getIndexDetails (serviceName, indexId) {
        return this.IndexAapiService.get({ serviceName, indexId })
            .$promise
            .then(index => this._transformAapiIndex(index));
    }

    _transformAapiIndex (index) {
        if (index.info.currentStorage < 0) {
            index.info.currentStorage = 0;
        }
        if (index.info.maxSize < 0) {
            index.info.maxSize = 0;
        }
        return index;
    }

    deleteModal (indexName) {
        return this.ControllerHelper.modal.showDeleteModal({
            titleText: this.$translate.instant("logs_modal_delete_title"),
            textHtml: this.$translate.instant("logs_modal_delete_question", { name: indexName })
        });
    }

    getSubscribedOptions (serviceName) {
        return this.LogsOptionsService.getSubscribedOptionsByType(serviceName, this.LogsConstants.INDEX_OPTION_REFERENCE);
    }

    createIndex (serviceName, object) {
        return this.IndexApiService.post({ serviceName }, object).$promise
            .then(operation => {
                this._resetAllCache();
                return this.LogsHelperService.handleOperation(serviceName, operation.data || operation, "logs_index_create_success", { name: object.suffix });
            })
            .catch(err => this.LogsHelperService.handleError("logs_index_create_error", err, { name: object.suffix }));
    }

    updateIndex (serviceName, index, indexInfo) {
        return this.IndexApiService.put({ serviceName, indexId: index.indexId }, indexInfo)
            .$promise
            .then(operation => {
                this._resetAllCache();
                return this.LogsHelperService.handleOperation(serviceName, operation.data || operation, "logs_index_edit_success", { name: index.name });
            })
            .catch(err => this.LogsHelperService.handleError("logs_index_edit_error", err, { name: index.name }));
    }

    deleteIndex (serviceName, index) {
        return this.IndexApiService.delete({ serviceName, indexId: index.indexId }).$promise
            .then(operation => {
                this._resetAllCache();
                return this.LogsHelperService.handleOperation(serviceName, operation.data || operation, "logs_index_delete_success", { name: index.name });
            })
            .catch(err => this.LogsHelperService.handleError("logs_index_delete_error", err, { name: index.name }));
    }

    _resetAllCache () {
        this.IndexApiService.resetAllCache();
        this.IndexAapiService.resetAllCache();
        this.AccountingAapiService.resetAllCache();
    }
}

angular.module("managerApp").service("LogsIndexService", LogsIndexService);
