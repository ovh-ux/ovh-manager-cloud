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
        if (this.$stateParams.streamId) {
            this.isEdit = true;
            this.stream = this.ControllerHelper.request.getHashLoader({
                loaderFunction: () => this.LogsStreamsService.getStream(this.serviceName, this.$stateParams.streamId)
            });
            this.stream.load();
        } else {
            this.isEdit = false;
            this.stream = {
                data: {
                    coldStorageCompression: this.compressionAlgorithms[0].value,
                    coldStorageRetention: this.storageDurations[0].value,
                    coldStorageNotifyEnabled: true,
                    coldStorageEnabled: false,
                    webSocketEnabled: true
                }
            };
        }
    }

    updateStream () {
        if (this.form.$invalid) {
            return this.$q.reject();
        }
        this.CloudMessage.flushChildMessage();
        this.saving = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () =>
                this.LogsStreamsService.updateStream(this.$stateParams.serviceName, this.stream.data)
                    .then(() => this.$state.go("dbaas.logs.detail.streams"))
        });
        this.saving.load();
        return this.saving;
    }

    createStream () {
        if (this.form.$invalid) {
            return this.$q.reject();
        }
        this.CloudMessage.flushChildMessage();
        this.saving = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () =>
                this.LogsStreamsService.createStream(this.$stateParams.serviceName, this.stream.data)
                    .then(() => this.$state.go("dbaas.logs.detail.streams"))
        });
        this.saving.load();
        return this.saving;
    }
}

angular.module("managerApp").controller("LogsStreamsAddCtrl", LogsStreamsAddCtrl);
