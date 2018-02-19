class LogsIndexService {
    constructor ($q, $translate, CloudPoll, ControllerHelper, OvhApiDbaas, ServiceHelper, LogsOptionsService, LogsIndexConstant) {
        this.$q = $q;
        this.$translate = $translate;
        this.CloudPoll = CloudPoll;
        this.ServiceHelper = ServiceHelper;
        this.ControllerHelper = ControllerHelper;
        this.LogsOptionsService = LogsOptionsService;
        this.LogsIndexConstant = LogsIndexConstant;
        this.IndexApiService = OvhApiDbaas.Logs().Index().Lexi();
        this.IndexAapiService = OvhApiDbaas.Logs().Index().Aapi();
        this.AccountingAapiService = OvhApiDbaas.Logs().Accounting().Aapi();
        this.OperationApiService = OvhApiDbaas.Logs().Operation().Lexi();
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
                    currentUsage: me.total.curNbIndex * 100 / me.total.maxNbIndex
                };
                return quota;
            }).catch(this.ServiceHelper.errorHandler("logs_streams_quota_get_error"));
    }

    getIndices (serviceName) {
        return this.IndexApiService.query({ serviceName }).$promise
            .then(indices => {
                const promises = indices.map(indexId => this.getIndexDetails(serviceName, indexId));
                return this.$q.all(promises);
            })
            .catch(this.ServiceHelper.errorHandler("logs_index_get_error"));
    }

    getIndexDetails (serviceName, indexId) {
        return this.IndexAapiService.get({ serviceName, indexId }).$promise;
    }

    deleteModal (indexName) {
        return this.ControllerHelper.modal.showDeleteModal({
            titleText: this.$translate.instant("logs_modal_delete_title"),
            text: this.$translate.instant("logs_modal_delete_question", { name: indexName })
        });
    }

    getSubscribedOptions (serviceName) {
        return this.LogsOptionsService.getSubscribedOptionsByType(serviceName, this.LogsIndexConstant.optionType);
    }

    createIndex (serviceName, object) {
        return this.IndexApiService.post({ serviceName }, object).$promise
            .then(operation => {
                this._resetAllCache();
                return this._handleSuccess(serviceName, operation.data, "logs_index_create_success");
            })
            .catch(this.ServiceHelper.errorHandler("logs_index_create_error"));
    }

    updateIndex (serviceName, indexId, indexInfo) {
        return this.IndexApiService.put({ serviceName, indexId }, indexInfo)
            .$promise
            .then(operation => {
                this._resetAllCache();
                return this._handleSuccess(serviceName, operation.data, "logs_index_edit_success");
            })
            .catch(this.ServiceHelper.errorHandler("logs_index_edit_error"));
    }

    deleteIndex (serviceName, indexId) {
        return this.IndexApiService.delete({ serviceName, indexId }).$promise
            .then(operation => {
                this._resetAllCache();
                return this._handleSuccess(serviceName, operation.data, "logs_index_delete_success");
            })
            .catch(this.ServiceHelper.errorHandler("logs_index_delete_error"));
    }

    _resetAllCache () {
        this.IndexApiService.resetAllCache();
        this.IndexAapiService.resetAllCache();
        this.AccountingAapiService.resetAllCache();
    }

    _handleSuccess (serviceName, operation, successMessage) {
        this.poller = this._pollOperation(serviceName, operation);
        return this.poller.$promise
            .then(this.ServiceHelper.successHandler(successMessage));
    }

    _killPoller () {
        if (this.poller) {
            this.poller.kill();
        }
    }

    _pollOperation (serviceName, operation) {
        this._killPoller();
        return this.CloudPoll.poll({
            item: operation,
            pollFunction: opn => this.OperationApiService.get({ serviceName, operationId: opn.operationId }).$promise,
            stopCondition: opn => opn.state === this.LogsIndexConstant.FAILURE || opn.state === this.LogsIndexConstant.SUCCESS
        });
    }
}

angular.module("managerApp").service("LogsIndexService", LogsIndexService);
