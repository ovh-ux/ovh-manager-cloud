class LogsStreamsAlertsHomeCtrl {
    constructor ($state, $stateParams, $translate, CloudMessage, ControllerHelper, LogsStreamsService, LogsStreamsAlertsConstant, LogsStreamsAlertsService) {
        this.$state = $state;
        this.$stateParams = $stateParams;
        this.$translate = $translate;
        this.CloudMessage = CloudMessage;
        this.ControllerHelper = ControllerHelper;
        this.LogsStreamsService = LogsStreamsService;
        this.LogsStreamsAlertsConstant = LogsStreamsAlertsConstant;
        this.LogsStreamsAlertsService = LogsStreamsAlertsService;

        this.serviceName = this.$stateParams.serviceName;
        this.streamId = this.$stateParams.streamId;
        this._initLoaders();
    }

    $onInit () {
        this._runLoaders();
    }

    /**
     * Runs all the loaders to fetch data from APIs
     *
     * @memberof LogsStreamsAlertsHomeCtrl
     */
    _runLoaders () {
        this.alertIds.load();
        this.stream.load();
    }

    /**
     * initializes the alertsIDs and current stream
     *
     * @memberof LogsStreamsAlertsHomeCtrl
     */
    _initLoaders () {
        this.alertIds = this.ControllerHelper.request.getArrayLoader({
            loaderFunction: () => this.LogsStreamsAlertsService.getAlertIds(this.serviceName, this.streamId)
        });
        this.stream = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () => this.LogsStreamsService.getStream(this.serviceName, this.streamId)
        });
    }

    /**
     * Loads a number of alerts specified by the pageSize, starting from the specified offset
     *
     * @param {any} offset
     * @param {any} pageSize
     * @returns promise which will be resolve to the loaded alerts data
     * @memberof LogsStreamsAlertsHomeCtrl
     */
    loadAlerts ({ offset, pageSize }) {
        this.alerts = this.ControllerHelper.request.getArrayLoader({
            loaderFunction: () => this.LogsStreamsAlertsService.getAlerts(
                this.serviceName,
                this.streamId,
                this.alertIds.data.slice(offset - 1, offset + pageSize - 1)
            )
        });

        return this.alerts.load()
            .then(alerts => ({
                data: alerts,
                meta: {
                    totalCount: this.alertIds.data.length
                }
            }));
    }

    /**
     * Shows the confirmation modal box for alert deletion confirmation
     * and deletes the alert if the user confirms the deletion
     *
     * @param {any} alert - the alert object
     * @memberof LogsStreamsAlertsHomeCtrl
     */
    showDeleteConfirm (alert) {
        this.CloudMessage.flushChildMessage();
        return this.ControllerHelper.modal.showDeleteModal({
            titleText: this.$translate.instant("streams_alerts_delete"),
            text: this.$translate.instant("streams_alerts_delete_message", { alert: alert.title })
        }).then(() => this._delete(alert));
    }

    /**
     * Deletes the alert
     *
     * @param {any} alert - the alert object
     * @memberof LogsStreamsAlertsHomeCtrl
     */
    _delete (alert) {
        this.delete = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () =>
                this.LogsStreamsAlertsService.deleteAlert(this.serviceName, this.streamId, alert.alertId)
                    .then(() => this._runLoaders())
        });
        this.alertIds.loading = true;
        this.delete.load();
    }

    /**
     * Redirects to the new alert add page
     *
     * @param {any} type - the type of the alert to add
     * @memberof LogsStreamsAlertsHomeCtrl
     */
    addAlert (type) {
        this.$state.go("dbaas.logs.detail.streams.alerts.add", {
            serviceName: this.serviceName,
            streamId: this.streamId,
            type: this.LogsStreamsAlertsConstant.alertType[type]
        });
    }
}

angular.module("managerApp").controller("LogsStreamsAlertsHomeCtrl", LogsStreamsAlertsHomeCtrl);
