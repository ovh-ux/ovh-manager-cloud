class LogsStreamsArchivesCtrl {
    constructor ($state, $stateParams, $translate, CloudMessage, ControllerHelper, LogsStreamsService, LogsStreamsArchivesConstant, LogsStreamsArchivesService) {
        this.$state = $state;
        this.$stateParams = $stateParams;
        this.$translate = $translate;
        this.CloudMessage = CloudMessage;
        this.ControllerHelper = ControllerHelper;
        this.LogsStreamsService = LogsStreamsService;
        this.LogsStreamsArchivesConstant = LogsStreamsArchivesConstant;
        this.LogsStreamsArchivesService = LogsStreamsArchivesService;

        this.serviceName = this.$stateParams.serviceName;
        this.streamId = this.$stateParams.streamId;
        this._initLoaders();
    }

    $onInit () {
        this.archiveIds.load();
        this.stream.load();
    }

    /**
     * initializes the archivesIDs and current stream
     *
     * @memberof LogsStreamsArchivesHomeCtrl
     */
    _initLoaders () {
        this.archiveIds = this.ControllerHelper.request.getArrayLoader({
            loaderFunction: () => this.LogsStreamsArchivesService.getArchiveIds(this.serviceName, this.streamId)
        });
        this.stream = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () => this.LogsStreamsService.getStream(this.serviceName, this.streamId)
        });
    }

    /**
     * Loads a number of archives specified by the pageSize, starting from the specified offset
     *
     * @param {any} offset
     * @param {any} pageSize
     * @returns promise which will be resolve to the loaded archives data
     * @memberof LogsStreamsArchivesHomeCtrl
     */
    loadArchives ({ offset, pageSize }) {
        this.archives = this.ControllerHelper.request.getArrayLoader({
            loaderFunction: () => this.LogsStreamsArchivesService.getArchives(
                this.serviceName,
                this.streamId,
                this.archiveIds.data.slice(offset - 1, offset + pageSize - 1)
            )
        });

        return this.archives.load()
            .then(archives => ({
                data: archives,
                meta: {
                    totalCount: this.archiveIds.data.length
                }
            }));
    }

    download (archive) {
        this.LogsStreamsArchivesService.downloadArchive(
            this.serviceName,
            this.streamId,
            archive
        );
    }
}

angular.module("managerApp").controller("LogsStreamsArchivesCtrl", LogsStreamsArchivesCtrl);
