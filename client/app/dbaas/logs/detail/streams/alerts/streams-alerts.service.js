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
     * @param {any} alert - the alert object
     * @returns promise which will be resolve to an operation object
     * @memberof StreamsAlertsService
     */
    addAlert (serviceName, streamId, alert) {
        return this.AlertsApiService.post({ serviceName, streamId }, alert).$promise
            .then(operation => this._handleSuccess(serviceName, operation.data, "streams_alerts_add_success"))
            .catch(this.ServiceHelper.errorHandler("streams_alerts_add_error"));
    }

    /**
     * Deletes an alert
     *
     * @param {any} serviceName
     * @param {any} streamId
     * @param {any} alertId - ID of the alert to be deleted
     * @returns promise which will be resolve to an operation object
     * @memberof StreamsAlertsService
     */
    deleteAlert (serviceName, streamId, alertId) {
        return this.AlertsApiService.delete({ serviceName, streamId, alertId }).$promise
            .then(operation => this._handleSuccess(serviceName, operation.data, "streams_alerts_delete_success"))
            .catch(this.ServiceHelper.errorHandler("streams_alerts_delete_error"));
    }

    /**
     * Get the IDs of all alerts
     *
     * @param {any} serviceName
     * @param {any} streamId
     * @returns promise which will be resolve with a list of alert IDs
     * @memberof StreamsAlertsService
     */
    getAlertIds (serviceName, streamId) {
        return this.AlertsApiService.query({
            serviceName,
            streamId
        }).$promise
            .catch(this.ServiceHelper.errorHandler("streams_alerts_ids_loading_error"));
    }

    /**
     * Gets the alert objects corresponding to the alertIds
     *
     * @param {any} serviceName
     * @param {any} streamId
     * @param {any} alertIds - list of alert IDs for which alert object is to be fetched
     * @returns promise which will be resolve with the list of alerts
     * @memberof StreamsAlertsService
     */
    getAlerts (serviceName, streamId, alertIds) {
        return this.getAlertDetails(serviceName, streamId, alertIds)
            .catch(this.ServiceHelper.errorHandler("streams_alerts_loading_error"));
    }

    /**
     * Gets the alert objects corresponding to the alertIds
     *
     * @param {any} serviceName
     * @param {any} streamId
     * @param {any} alertIds - list of alert IDs for which alert object is to be fetched
     * @returns promise which will be resolve with the list of alerts
     * @memberof StreamsAlertsService
     */
    getAlertDetails (serviceName, streamId, alertIds) {
        const promises = alertIds.map(alertId => this.getAlert(serviceName, streamId, alertId));
        return this.$q.all(promises);
    }

    /**
     * Gets the alert object corresponding to the alertId
     *
     * @param {any} serviceName
     * @param {any} streamId
     * @param {any} alertId - the alert ID for which alert object is to be fetched
     * @returns promise which will be resolve with the alert
     * @memberof StreamsAlertsService
     */
    getAlert (serviceName, streamId, alertId) {
        return this.AlertsApiService.get({ serviceName, streamId, alertId }).$promise;
    }

    /**
     * Returns a new alert object with the default properties
     *
     * @param {any} conditionType - the type of the condition (one of StreamsAlertsConstant.alertType)
     * @returns the default alert object
     * @memberof StreamsAlertsService
     */
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
     * handles success state for create and delete alerts.
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

    /**
     * Kills the current poller
     *
     * @memberof LogsStreamsService
     */
    _killPoller () {
        if (this.poller) {
            this.poller.kill();
        }
    }

    /**
     * Sets up polling for an operation
     *
     * @param {any} serviceName
     * @param {any} operation, operation to poll
     * @returns returns the poller promise that resolves when the polling for success is complete
     * @memberof LogsStreamsService
     */
    _pollOperation (serviceName, operation) {
        this._killPoller();
        const poller = this.CloudPoll.poll({
            item: operation,
            pollFunction: opn => this.OperationApiService.get({ serviceName, operationId: opn.operationId }).$promise,
            stopCondition: opn => opn.state === "FAILURE" || opn.state === "SUCCESS"
        });
        return poller;
    }
}

angular.module("managerApp").service("StreamsAlertsService", StreamsAlertsService);
