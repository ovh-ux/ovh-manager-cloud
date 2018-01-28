class LogsStreamsService {
    constructor ($q, OvhApiDbaas, ServiceHelper, CloudPoll, $translate) {
        this.$q = $q;
        this.ServiceHelper = ServiceHelper;
        this.LogsApiService = OvhApiDbaas.Logs().Lexi();
        this.StreamsApiService = OvhApiDbaas.Logs().Stream().Lexi();
        this.AccountingAapiService = OvhApiDbaas.Logs().Accounting().Aapi();
        this.OperationApiService = OvhApiDbaas.Logs().Operation().Lexi();
        this.CloudPoll = CloudPoll;
        this.$translate = $translate;

        this.initializeData();
    }

    initializeData () {
        this.compressionAlgorithms = [
            {
                value: "GZIP",
                name: this.$translate.instant("logs_stream_compression_gzip")
            },
            {
                value: "DEFLATED",
                name: this.$translate.instant("logs_stream_compression_zip")
            },
            {
                value: "LZMA",
                name: this.$translate.instant("logs_stream_compression_lzma")
            },
            {
                value: "ZSTD",
                name: this.$translate.instant("logs_stream_compression_zstd")
            }
        ];

        this.storageDurations = [
            {
                value: 1,
                name: this.$translate.instant("logs_stream_retention_1y")
            },
            {
                value: 2,
                name: this.$translate.instant("logs_stream_retention_2y")
            },
            {
                value: 5,
                name: this.$translate.instant("logs_stream_retention_5y")
            },
            {
                value: 10,
                name: this.$translate.instant("logs_stream_retention_10y")
            }
        ];
    }

    /**
     * returns array of streams with details of logged in user
     *
     * @param {any} serviceName
     * @returns promise which will be resolve to array of streams. each stream will have all details populated.
     * @memberof LogsStreamsService
     */
    getStreams (serviceName) {
        return this.getStreamDetails(serviceName)
            .then(streams => streams.map(stream => this.transformStream(serviceName, stream)))
            .catch(this.ServiceHelper.errorHandler("logs_streams_get_error"));
    }

    /**
     * gets stream details for each stream in array
     *
     * @param {any} serviceName
     * @returns promise which will be resolve to array of streams
     * @memberof LogsStreamsService
     */
    getStreamDetails (serviceName) {
        return this.getAllStreams(serviceName)
            .then(streams => {
                const promises = streams.map(stream => this.getStream(serviceName, stream));
                return this.$q.all(promises);
            });
    }

    /**
     * returns details of a stream
     *
     * @param {any} serviceName
     * @param {any} streamId
     * @returns promise which will be resolve to stream object
     * @memberof LogsStreamsService
     */
    getStream (serviceName, streamId) {
        return this.StreamsApiService.get({ serviceName, streamId })
            .$promise.catch(this.ServiceHelper.errorHandler("logs_stream_get_error"));
    }

    deleteStream (serviceName, stream) {
        return this.StreamsApiService.delete({ serviceName, streamId: stream.streamId }, stream)
            .$promise
            .then(operation => {
                this.resetAllCache();
                return this.handleSuccess(serviceName, operation.data, "logs_stream_delete_success");
            })
            .catch(this.ServiceHelper.errorHandler("logs_stream_delete_error"));
    }

    createStream (serviceName, stream) {
        return this.StreamsApiService.create({ serviceName }, stream)
            .$promise
            .then(operation => {
                this.resetAllCache();
                return this.handleSuccess(serviceName, operation.data, "logs_stream_create_success");
            })
            .catch(this.ServiceHelper.errorHandler("logs_stream_create_error"));
    }

    updateStream (serviceName, stream) {
        return this.StreamsApiService.update({ serviceName, streamId: stream.streamId }, stream)
            .$promise
            .then(operation => this.handleSuccess(serviceName, operation.data, "logs_stream_update_success"))
            .catch(this.ServiceHelper.errorHandler("logs_stream_update_error"));
    }

    handleSuccess (serviceName, operation, successMessage) {
        this.poller = this.pollOperation(serviceName, operation);
        return this.poller.$promise
            .then(this.ServiceHelper.successHandler(successMessage));
    }

    /**
     * returns array of stream id's of logged in user
     *
     * @param {any} serviceName
     * @returns promise which will be resolve to array of stream id's
     * @memberof LogsStreamsService
     */
    getAllStreams (serviceName) {
        return this.LogsApiService.streams({ serviceName }).$promise;
    }

    /**
     * returns all notifications configured for a given stream
     *
     * @param {any} serviceName
     * @param {any} streamId
     * @returns promise which will be resolve to array of notifications
     * @memberof LogsStreamsService
     */
    getNotifications (serviceName, streamId) {
        return this.StreamsApiService.notifications({ serviceName, streamId }).$promise;
    }

    /**
     * returns objecy containing total number of streams and total number of streams used
     *
     * @param {any} serviceName
     * @returns quota object containing V (total number streams) and configured (number of streams used)
     * @memberof LogsStreamsService
     */
    getQuota (serviceName) {
        return this.AccountingAapiService.me({ serviceName }).$promise
            .then(me => {
                const quota = {
                    max: me.total.maxNbStream,
                    configured: me.total.curNbStream,
                    currentUsage: me.total.curNbStream * 100 / me.total.maxNbStream
                };
                return quota;
            }).catch(this.ServiceHelper.errorHandler("logs_streams_quota_get_error"));
    }

    getCompressionAlgorithms () {
        return this.compressionAlgorithms;
    }

    getStorageDurations () {
        return this.storageDurations;
    }

    /**
     * asynchronously gets notifications of a stream
     *
     * @param {any} serviceName
     * @param {any} stream
     * @returns stream object after adding notifications
     * @memberof LogsStreamsService
     */
    transformStream (serviceName, stream) {
        stream.notifications = [];
        // asynchronously fetch all notification of a stream
        this.getNotifications(serviceName, stream.streamId)
            .then(notifications => {
                stream.notifications = notifications;
            }).catch(this.ServiceHelper.errorHandler("logs_streams_notifications_get_error"));
        return stream;
    }

    killPollar () {
        if (this.poller) {
            this.poller.kill();
        }
    }

    resetAllCache () {
        this.LogsApiService.resetAllCache();
        this.StreamsApiService.resetAllCache();
        this.AccountingAapiService.resetAllCache();
    }

    pollOperation (serviceName, operation) {
        this.killPollar();
        const pollar = this.CloudPoll.poll({
            item: operation,
            pollFunction: opn => this.OperationApiService.get({ serviceName, operationId: opn.operationId }).$promise,
            stopCondition: opn => opn.state === "FAILURE" || opn.state === "SUCCESS"
        });
        return pollar;
    }
}

angular.module("managerApp").service("LogsStreamsService", LogsStreamsService);
