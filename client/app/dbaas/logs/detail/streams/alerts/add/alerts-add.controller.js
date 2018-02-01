class AlertsAddCtrl {
    constructor ($q, $state, $stateParams, $window, CloudMessage, ControllerHelper, StreamsAlertsService) {
        this.$q = $q;
        this.$state = $state;
        this.serviceName = $stateParams.serviceName;
        this.streamId = $stateParams.streamId;
        this.alertType = $stateParams.type;
        this.$window = $window;
        this.CloudMessage = CloudMessage;
        this.ControllerHelper = ControllerHelper;
        this.StreamsAlertsService = StreamsAlertsService;
    }

    $onInit () {
        this.alert = this.StreamsAlertsService.getNewAlert(this.alertType);
    }

    /**
     * Adds a new alert by making an API call
     *
     * @memberof AlertsAddCtrl
     */
    addAlert () {
        if (this.form.$invalid) {
            return this.$q.reject();
        }

        this.CloudMessage.flushChildMessage();
        this.addingAlert = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () =>
                this.StreamsAlertsService.addAlert(this.serviceName, this.streamId, this.alert)
                    .then(() => this.$state.go("dbaas.logs.detail.streams.alerts"))
        });
        return this.addingAlert.load();
    }

    /**
     * Cancels the Alert add operation and redirects
     * to the page from which the user reached here
     *
     * @memberof AlertsAddCtrl
     */
    cancel () {
        this.$window.history.back();
    }
}

angular.module("managerApp").controller("AlertsAddCtrl", AlertsAddCtrl);
