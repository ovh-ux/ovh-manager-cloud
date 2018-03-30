class LogsStreamsAlertsAddCtrl {
    constructor ($q, $state, $stateParams, $window, CloudMessage, ControllerHelper, LogsStreamsAlertsAddConstant, LogsStreamsAlertsConstant, LogsStreamsAlertsService) {
        this.$q = $q;
        this.$state = $state;
        this.serviceName = $stateParams.serviceName;
        this.streamId = $stateParams.streamId;
        this.alertId = $stateParams.alertId;
        this.alertType = $stateParams.type;
        this.editMode = Boolean(this.alertId);
        this.$window = $window;
        this.CloudMessage = CloudMessage;
        this.ControllerHelper = ControllerHelper;
        this.LogsStreamsAlertsAddConstant = LogsStreamsAlertsAddConstant;
        this.LogsStreamsAlertsConstant = LogsStreamsAlertsConstant;
        this.LogsStreamsAlertsService = LogsStreamsAlertsService;
    }

    $onInit () {
        if (this.editMode) {
            this.alert = this.ControllerHelper.request.getHashLoader({
                loaderFunction: () => this.LogsStreamsAlertsService.getAlert(this.serviceName, this.streamId, this.alertId)
            });
            this.alert.load()
                .then(alert => {
                    this.alertType = alert.conditionType;
                });
        } else {
            this.LogsStreamsAlertsService.getNewAlert(this.alertType)
                .then(alert => { this.alert = alert; });
        }
    }

    /**
     * Redirects back to the previous page
     * from which the user reached here
     *
     * @memberof LogsStreamsAlertsAddCtrl
     */
    _goBack () {
        this.$window.history.back();
    }

    /**
     * Adds a new alert by making an API call
     *
     * @memberof LogsStreamsAlertsAddCtrl
     */
    saveAlert () {
        if (this.form.$invalid) {
            return this.$q.reject();
        }

        this.CloudMessage.flushChildMessage();
        this.savingAlert = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () => this.editMode ?
                this.LogsStreamsAlertsService.updateAlert(this.serviceName, this.streamId, this.alert.data) :
                this.LogsStreamsAlertsService.addAlert(this.serviceName, this.streamId, this.alert.data)
        });
        return this.savingAlert.load()
            .then(() => this._goBack());
    }

    /**
     * Cancels the Alert add operation and redirects
     * to the page from which the user reached here
     *
     * @memberof LogsStreamsAlertsAddCtrl
     */
    cancel () {
        this._goBack();
    }

    /**
     * Returns the valid threshold types based on the condition (alert) type
     *
     * @memberof LogsStreamsAlertsAddCtrl
     */
    getThresholdTypes () {
        if (this.alertType === this.LogsStreamsAlertsConstant.alertType.numeric) {
            return [this.LogsStreamsAlertsConstant.thresholdType.lower, this.LogsStreamsAlertsConstant.thresholdType.higher];
        }
        return [this.LogsStreamsAlertsConstant.thresholdType.more, this.LogsStreamsAlertsConstant.thresholdType.less];
    }

    /**
     * Returns the constraint types
     *
     * @memberof LogsStreamsAlertsAddCtrl
     */
    getConstraintTypes () {
        return Object.values(this.LogsStreamsAlertsConstant.constraintType);
    }
}

angular.module("managerApp").controller("LogsStreamsAlertsAddCtrl", LogsStreamsAlertsAddCtrl);
