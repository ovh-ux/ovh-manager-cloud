class LogsStreamsFollowCtrl {
    constructor ($stateParams, LogsStreamsService, ControllerHelper) {
        this.$stateParams = $stateParams;
        this.LogsStreamsService = LogsStreamsService;
        this.ControllerHelper = ControllerHelper;

        this.initLoaders();
    }

    initLoaders () {
        this.stream = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () => this.LogsStreamsService.getAapiStream(this.$stateParams.serviceName, this.$stateParams.streamId)
        });
        this.stream.load();
    }
}

angular.module("managerApp").controller("LogsStreamsFollowCtrl", LogsStreamsFollowCtrl);
