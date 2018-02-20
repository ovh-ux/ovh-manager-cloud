class LogsAliasesLinkCtrl {
    constructor ($stateParams, LogsAliasesService, ControllerHelper, LogsStreamsService, LogsIndexService) {
        this.$stateParams = $stateParams;
        this.serviceName = this.$stateParams.serviceName;
        this.LogsAliasesService = LogsAliasesService;
        this.ControllerHelper = ControllerHelper;
        this.LogsStreamsService = LogsStreamsService;
        this.LogsIndexService = LogsIndexService;

        this.initLoaders();
    }

    /**
     * load data
     *
     * @memberof LogsAliasesLinkCtrl
     */
    initLoaders () {
        this.alias = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () => this.LogsAliasesService.getAliasWithStreamsAndIndices(this.serviceName, this.$stateParams.aliasId)
                .then(aliases => {
                    console.log("aliases", aliases);
                    if (aliases.streams.length > 0) {
                        this.selectedContent = this.contents[0].value;
                    } else if (aliases.indexes.length > 0) {
                        this.selectedContent = this.contents[1].value;
                    }
                    return aliases;
                })
        });
        this.alias.load();

        this.streams = this.ControllerHelper.request.getArrayLoader({
            loaderFunction: () => this.LogsStreamsService.getStreams(this.serviceName)
        });
        this.streams.load();

        this.indices = this.ControllerHelper.request.getArrayLoader({
            loaderFunction: () => this.LogsIndexService.getIndices(this.serviceName)
        });
        this.indices.load();

        this.contents = this.LogsAliasesService.getContents();
        this.selectedContent = this.contents[0].value;
    }

    onContentChange () {
        //
    }
}

angular.module("managerApp").controller("LogsAliasesLinkCtrl", LogsAliasesLinkCtrl);
