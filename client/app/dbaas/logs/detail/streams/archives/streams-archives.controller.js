class LogsStreamsArchivesCtrl {
    constructor ($stateParams) {
        this.$stateParams = $stateParams;
        this.serviceName = this.$stateParams.serviceName;
        this.stream = this.$stateParams.streamId;
    }
}

angular.module("managerApp").controller("LogsStreamsArchivesCtrl", LogsStreamsArchivesCtrl);
