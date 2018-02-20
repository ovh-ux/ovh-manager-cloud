class LogsAliasesLinkCtrl {
    constructor ($stateParams, LogsAliasesService, ControllerHelper, LogsStreamsService) {
        this.$stateParams = $stateParams;
        this.serviceName = this.$stateParams.serviceName;
        this.LogsAliasesService = LogsAliasesService;
        this.ControllerHelper = ControllerHelper;
        this.LogsStreamsService = LogsStreamsService;

        this.initLoaders();
    }

    /**
     * load data
     *
     * @memberof LogsAliasesLinkCtrl
     */
    initLoaders () {
        this.alias = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () => this.LogsAliasesService.getAliasWithStreamsIndices(this.serviceName, this.$stateParams.aliasId)
        });
        this.alias.load();

        this.streams = this.ControllerHelper.request.getArrayLoader({
            loaderFunction: () => this.LogsStreamsService.getStreams(this.serviceName)
        });
        this.streams.load();

        this.targets = [
            { value: "streams", name: "logs_streams_title" },
            { value: "indices", name: "logs_index_title" }
        ];
        this.selectedTarget = this.targets[0].value;
    }

    onTargetChange () {
        //
    }
}

angular.module("managerApp").controller("LogsAliasesLinkCtrl", LogsAliasesLinkCtrl);
