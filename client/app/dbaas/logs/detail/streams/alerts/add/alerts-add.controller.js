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
     * Adds a new alert
     *
     * @memberof LogsStreamsHomeCtrl
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

    cancel () {
        this.$window.history.back();
    }
}

angular.module("managerApp").controller("AlertsAddCtrl", AlertsAddCtrl);
