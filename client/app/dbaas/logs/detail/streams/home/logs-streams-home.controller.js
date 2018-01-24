class LogsStreamsHomeCtrl {
    constructor ($state, $stateParams, LogsStreamsService, ControllerHelper) {
        this.$state = $state;
        this.$stateParams = $stateParams;
        this.serviceName = this.$stateParams.serviceName;
        this.LogsStreamsService = LogsStreamsService;
        this.ControllerHelper = ControllerHelper;

        this.initLoaders();
    }

    $onInit () {
        this.quota.load();
        this.streams.load();
    }

    /**
     * initializes streams and quota object by making API call to get data
     *
     * @memberof LogsStreamsHomeCtrl
     */
    initLoaders () {
        this.quota = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () => this.LogsStreamsService.getQuota(this.serviceName)
        });
        this.streams = this.ControllerHelper.request.getArrayLoader({
            loaderFunction: () => this.LogsStreamsService.getStreams(this.serviceName)
        });
    }

    /**
     * takes to edit stream page
     *
     * @param {any} stream
     * @memberof LogsStreamsHomeCtrl
     */
    edit (stream) {
        this.$state.go("dbaas.logs.detail.streams.edit", {
            serviceName: this.serviceName,
            streamId: stream.streamId
        });
    }
}

angular.module("managerApp").controller("LogsStreamsHomeCtrl", LogsStreamsHomeCtrl);
