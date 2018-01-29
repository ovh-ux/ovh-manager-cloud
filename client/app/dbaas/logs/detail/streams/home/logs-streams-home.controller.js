class LogsStreamsHomeCtrl {
    constructor ($state, $stateParams, $translate, LogsStreamsService, ControllerHelper, CloudMessage) {
        this.$state = $state;
        this.$stateParams = $stateParams;
        this.$translate = $translate;
        this.serviceName = this.$stateParams.serviceName;
        this.LogsStreamsService = LogsStreamsService;
        this.ControllerHelper = ControllerHelper;
        this.CloudMessage = CloudMessage;

        this.initLoaders();
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
        this.quota.load();
        this.streams.load();
    }

    /**
     * create stream
     *
     * @memberof LogsStreamsHomeCtrl
     */
    create () {
        this.LogsStreamsService.createStream(this.serviceName)
            .then(() => this.initLoaders());
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

    /**
     * show delete stream confirmation modal
     *
     * @param {any} stream to delete
     * @memberof LogsStreamsHomeCtrl
     */
    showDeleteConfirm (stream) {
        this.CloudMessage.flushChildMessage();
        return this.ControllerHelper.modal.showDeleteModal({
            titleText: this.$translate.instant("logs_stream_delete_title"),
            text: this.$translate.instant("logs_stream_delete_message", { stream: stream.title })
        }).then(this.delete(stream));
    }

    /**
     * delete stream
     *
     * @param {any} stream to delete
     * @memberof LogsStreamsHomeCtrl
     */
    delete (stream) {
        this.delete = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () =>
                this.LogsStreamsService.deleteStream(this.serviceName, stream)
                    .then(() => this.initLoaders())
        });
        this.delete.load();
    }
}

angular.module("managerApp").controller("LogsStreamsHomeCtrl", LogsStreamsHomeCtrl);
