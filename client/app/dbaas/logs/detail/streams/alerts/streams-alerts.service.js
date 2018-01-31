class StreamsAlertsService {
    constructor ($q, CloudPoll, OvhApiDbaas, ServiceHelper, StreamsAlertsConstant) {
        this.$q = $q;
        this.CloudPoll = CloudPoll;
        this.OperationApiService = OvhApiDbaas.Logs().Operation().Lexi();
        this.AlertsApiService = OvhApiDbaas.Logs().Alert().Lexi();
        this.ServiceHelper = ServiceHelper;
        this.StreamsAlertsConstant = StreamsAlertsConstant;
    }

    /**
     * Adds a new alert
     *
     * @param {any} serviceName
     * @param {any} streamId
     * @param {any} alert the alert object
     * @returns promise which will be resolve to operation object
     * @memberof StreamsAlertsService
     */
    addAlert (serviceName, streamId, alert) {
        return this.AlertsApiService.post({ serviceName, streamId }, alert).$promise
            .then(operation => {
                this._resetAllCache();
                return this._handleSuccess(serviceName, operation.data, "streams_alerts_add_success");
            })
            .catch(this.ServiceHelper.errorHandler("streams_alerts_add_error"));
    }

    deleteAlert (serviceName, streamId, alertId) {
        return this.AlertsApiService.delete({ serviceName, streamId, alertId }).$promise
            .then(operation => {
                this._resetAllCache();
                return this._handleSuccess(serviceName, operation.data, "streams_alerts_delete_success");
            })
            .catch(this.ServiceHelper.errorHandler("streams_alerts_delete_error"));
    }

    getAlertIds (serviceName, streamId) {
        return this.AlertsApiService.query({
            serviceName,
            streamId
        }).$promise
            .catch(this.ServiceHelper.errorHandler("streams_alerts_ids_loading_error"));
    }

    getAlerts (serviceName, streamId, alertIds) {
        return this.getAlertDetails(serviceName, streamId, alertIds)
            .catch(this.ServiceHelper.errorHandler("streams_alerts_loading_error"));
    }

    getAlertDetails (serviceName, streamId, alertIds) {
        const promises = alertIds.map(alertId => this.getAlert(serviceName, streamId, alertId));
        return this.$q.all(promises);
    }

    getAlert (serviceName, streamId, alertId) {
        return this.AlertsApiService.get({ serviceName, streamId, alertId }).$promise;
    }

    getNewAlert (conditionType) {
        const thresholdType = conditionType === this.StreamsAlertsConstant.alertType.numeric ?
            this.StreamsAlertsConstant.thresholdType.lower :
            this.StreamsAlertsConstant.thresholdType.more;
        const constraintType = this.StreamsAlertsConstant.constraintType.mean;
        return {
            conditionType,
            thresholdType,
            threshold: 1,
            time: 1,
            grace: 1,
            backlog: 1,
            repeatNotificationsEnabled: false,
            constraintType
        };
    }

    /**
     * handles success state for create, delete and update streams.
     * Repetedly polls for operation untill it returns SUCCESS message.
     *
     * @param {any} serviceName
     * @param {any} operation, operation to poll
     * @param {any} successMessage, message to show on UI
     * @returns promise which will be resolved to operation object
     * @memberof LogsStreamsService
     */
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
        const poller = this.CloudPoll.poll({
            item: operation,
            pollFunction: opn => this.OperationApiService.get({ serviceName, operationId: opn.operationId }).$promise,
            stopCondition: opn => opn.state === "FAILURE" || opn.state === "SUCCESS"
        });
        return poller;
    }

    _resetAllCache () {
        this.AlertsApiService.resetAllCache();
    }
}

angular.module("managerApp").service("StreamsAlertsService", StreamsAlertsService);
