class LogsStreamsAddCtrl {
    constructor ($q, $state, $stateParams, LogsStreamsService, ControllerHelper, CloudMessage) {
        this.$q = $q;
        this.$state = $state;
        this.$stateParams = $stateParams;
        this.serviceName = this.$stateParams.serviceName;
        this.LogsStreamsService = LogsStreamsService;
        this.ControllerHelper = ControllerHelper;
        this.CloudMessage = CloudMessage;
        this.isEdit = false;
        this.compressionAlgorithms = this.LogsStreamsService.getCompressionAlgorithms();
        this.storageDurations = this.LogsStreamsService.getStorageDurations();

        this.initLoaders();
    }

    /**
     * initializes options list
     *
     * @memberof LogsStreamsHomeCtrl
     */
    initLoaders () {
        this.options = this.ControllerHelper.request.getArrayLoader({
            loaderFunction: () => this.LogsStreamsService.getSubscribedOptions(this.serviceName)
        });
        this.options.load();

        this.mainOffer = this.ControllerHelper.request.getArrayLoader({
            loaderFunction: () => this.LogsStreamsService.getMainOffer(this.serviceName)
        });
        this.mainOffer.load();

        if (this.$stateParams.streamId) {
            this.isEdit = true;
            this.stream = this.ControllerHelper.request.getHashLoader({
                loaderFunction: () => this.LogsStreamsService.getStream(this.serviceName, this.$stateParams.streamId)
            });
            this.stream.load();
        } else {
            this.isEdit = false;
            this.stream = this.LogsStreamsService.getNewStream();
        }
    }

    /**
     * update stream
     *
     * @memberof LogsStreamsHomeCtrl
     */
    updateStream () {
        if (this.form.$invalid) {
            return this.$q.reject();
        }
        this.CloudMessage.flushChildMessage();
        this.saving = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () =>
                this.LogsStreamsService.updateStream(this.serviceName, this.stream.data)
                    .then(() => this.$state.go("dbaas.logs.detail.streams"))
                    .catch(() => this.ControllerHelper.scrollPageToTop())
        });
        return this.saving.load();
    }

    /**
     * create new stream
     *
     * @memberof LogsStreamsHomeCtrl
     */
    createStream () {
        if (this.form.$invalid) {
            return this.$q.reject();
        }
        this.CloudMessage.flushChildMessage();
        this.saving = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () =>
                this.LogsStreamsService.createStream(this.serviceName, this.stream.data)
                    .then(() => this.$state.go("dbaas.logs.detail.streams"))
                    .catch(() => this.ControllerHelper.scrollPageToTop())
        });
        return this.saving.load();
    }
}

angular.module("managerApp").controller("LogsStreamsAddCtrl", LogsStreamsAddCtrl);
