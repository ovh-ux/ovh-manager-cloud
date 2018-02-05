class LogsStreamsService {
    constructor ($q, $translate, OvhApiDbaas, ServiceHelper, CloudPoll,
                 LogsOptionsService, ControllerHelper, UrlHelper, CloudMessage, LogStreamsConstants) {
        this.$q = $q;
        this.$translate = $translate;
        this.ServiceHelper = ServiceHelper;
        this.LogsApiService = OvhApiDbaas.Logs().Lexi();
        this.StreamsApiService = OvhApiDbaas.Logs().Stream().Lexi();
        this.StreamsAapiService = OvhApiDbaas.Logs().Stream().Aapi();
        this.AccountingAapiService = OvhApiDbaas.Logs().Accounting().Aapi();
        this.OperationApiService = OvhApiDbaas.Logs().Operation().Lexi();
        this.CloudPoll = CloudPoll;
        this.LogsOptionsService = LogsOptionsService;
        this.ControllerHelper = ControllerHelper;
        this.UrlHelper = UrlHelper;
        this.CloudMessage = CloudMessage;
        this.LogStreamsConstants = LogStreamsConstants;

        this.initializeData();
    }

    initializeData () {
        this.compressionAlgorithms = [
            {
                value: this.LogStreamsConstants.GZIP,
                name: this.$translate.instant("logs_stream_compression_gzip")
            },
            {
                value: this.LogStreamsConstants.DEFLATED,
                name: this.$translate.instant("logs_stream_compression_zip")
            },
            {
                value: this.LogStreamsConstants.LZMA,
                name: this.$translate.instant("logs_stream_compression_lzma")
            },
            {
                value: this.LogStreamsConstants.ZSTD,
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
            .then(streams => streams.map(stream => this._transformStream(serviceName, stream)))
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
                const promises = streams.map(stream => this.getAapiStream(serviceName, stream));
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

    /**
     * returns details of a stream making call to Aapi (2api) service
     *
     * @param {any} serviceName
     * @param {any} streamId
     * @returns promise which will be resolve to stream object
     * @memberof LogsStreamsService
     */
    getAapiStream (serviceName, streamId) {
        return this.StreamsAapiService.get({ serviceName, streamId })
            .$promise.catch(this.ServiceHelper.errorHandler("logs_stream_get_error"));
    }

    /**
     * delete stream
     *
     * @param {any} serviceName
     * @param {any} stream, stream object to be deleted
     * @returns promise which will be resolve to operation object
     * @memberof LogsStreamsService
     */
    deleteStream (serviceName, stream) {
        return this.StreamsApiService.delete({ serviceName, streamId: stream.streamId }, stream)
            .$promise
            .then(operation => {
                this._resetAllCache();
                return this._handleSuccess(serviceName, operation.data, "logs_stream_delete_success");
            })
            .catch(this.ServiceHelper.errorHandler("logs_stream_delete_error"));
    }

    /**
     * create new stream
     *
     * @param {any} serviceName
     * @param {any} stream, stream object to be created
     * @returns promise which will be resolve to operation object
     * @memberof LogsStreamsService
     */
    createStream (serviceName, stream) {
        return this.StreamsApiService.create({ serviceName }, stream)
            .$promise
            .then(operation => {
                this._resetAllCache();
                return this._handleSuccess(serviceName, operation.data, "logs_stream_create_success");
            })
            .catch(this.ServiceHelper.errorHandler("logs_stream_create_error"));
    }

    /**
     * update stream
     *
     * @param {any} serviceName
     * @param {any} stream, stream object to be updated
     * @returns promise which will be resolve to operation object
     * @memberof LogsStreamsService
     */
    updateStream (serviceName, stream) {
        return this.StreamsApiService.update({ serviceName, streamId: stream.streamId }, stream)
            .$promise
            .then(operation => {
                this._resetAllCache();
                return this._handleSuccess(serviceName, operation.data, "logs_stream_update_success");
            })
            .catch(this.ServiceHelper.errorHandler("logs_stream_update_error"));
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
        return this.StreamsApiService.notifications({ serviceName, streamId })
            .$promise
            .catch(this.ServiceHelper.errorHandler("logs_streams_notifications_get_error"));
    }

    /**
     * returns all archives configured for a given stream
     *
     * @param {any} serviceName
     * @param {any} streamId
     * @returns promise which will be resolve to array of archives
     * @memberof LogsStreamsService
     */
    getArchives (serviceName, streamId) {
        return this.StreamsApiService.archives({ serviceName, streamId })
            .$promise
            .catch(this.ServiceHelper.errorHandler("logs_streams_archives_get_error"));
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

    getSubscribedOptions (serviceName) {
        return this.LogsOptionsService.getStreamSubscribedOptions(serviceName);
    }

    /**
     * creates new stream with default values
     *
     * @returns stream object with default values
     * @memberof LogsStreamsService
     */
    getNewStream () {
        return {
            data: {
                coldStorageCompression: this.compressionAlgorithms[0].value,
                coldStorageRetention: this.storageDurations[0].value,
                coldStorageNotifyEnabled: true,
                coldStorageEnabled: false,
                webSocketEnabled: true
            },
            loading: false
        };
    }

    /**
     * extracts graylog URL from stream. Shows error message on UI if no graylog URL is found.
     *
     * @param {any} stream
     * @returns {string} graylog url, if not found empty string
     * @memberof LogsStreamsService
     */
    getStreamGraylogUrl (stream) {
        const url = this.UrlHelper.findUrl(stream, this.LogStreamsConstants.GRAYLOG_WEBUI);
        if (!url) {
            this.CloudMessage.error(this.$translate.instant("logs_streams_get_graylog_url_error", { stream: stream.info.title }));
        }
        return url;
    }

    /**
     * extracts and copies stream token to clipboard.
     * Shows error message on UI if no no token found or browser does not support clipboard copy.
     *
     * @param {any} stream
     * @memberof LogsStreamsService
     */
    copyStreamToken (stream) {
        const token = this.getStreamToken(stream);
        if (token) {
            const error = this.ControllerHelper.copyToClipboard(token);
            if (error) {
                this.CloudMessage.error(this.$translate.instant("logs_streams_copy_token_error", {
                    stream: stream.info.title,
                    token_value: token
                }));
            } else {
                this.CloudMessage.success(this.$translate.instant("logs_streams_copy_token_success"));
            }
        }
    }

    /**
     * Extracts X-OVH-TOKEN token from given stream.
     * Throws exception on UI if token was not found.
     * @param {object} stream
     * @return {string} stream token if found, empty string otherwise
     */
    getStreamToken (stream) {
        const token = this.findStreamTokenValue(stream);
        if (!token) {
            this.CloudMessage.error(this.$translate.instant("logs_streams_find_token_error", { stream: stream.info.title }));
        }
        return token;
    }

    /**
     * extracts X-OVH-TOKEN token from given stream
     * @param {object} stream
     * @return {string} stream token if found, empty string otherwise
     */
    findStreamTokenValue (stream) {
        const ruleObj = _.find(stream.rules, rule => rule.field === this.LogStreamsConstants.X_OVH_TOKEN);
        return _.get(ruleObj, "value", "");
    }

    /**
     * add additional data to stream before sending back to controller
     * 1. asynchronously gets notifications of a stream
     * 2. asynchronously gets archives of a stream
     * 3. updates operationStreamMap to get number of streams assigned to each operation
     *
     * @param {any} serviceName
     * @param {any} stream
     * @returns stream object after adding notifications
     * @memberof LogsStreamsService
     */
    _transformStream (serviceName, stream) {
        stream.info.notifications = [];
        stream.info.archives = [];
        // asynchronously fetch all notification of a stream
        this.getNotifications(serviceName, stream.info.streamId)
            .then(notifications => {
                stream.info.notifications = notifications;
            });
        // asynchronously fetch all archives of a stream
        this.getArchives(serviceName, stream.info.streamId)
            .then(archives => {
                stream.info.archives = archives;
            });
        return stream;
    }

    /**
     * handles success state for create, delete and update streams.
     * Repetedly polls for operation untill it returns SUCCESS message.
     *
     * @param {any} serviceName
     * @param {any} operation, operation to poll
     * @param {any} successMessage, message to show on UI
     * @returns promise which will be resolved to operation object
     * @memberof LogsStreamsService
     */
    _handleSuccess (serviceName, operation, successMessage) {
        this.poller = this._pollOperation(serviceName, operation);
        return this.poller.$promise
            .then(this.ServiceHelper.successHandler(successMessage));
    }

    _killPoller () {
        if (this.poller) {
            this.poller.kill();
        }
    }

    _resetAllCache () {
        this.LogsApiService.resetAllCache();
        this.StreamsApiService.resetAllCache();
        this.StreamsAapiService.resetAllCache();
        this.AccountingAapiService.resetAllCache();
    }

    _pollOperation (serviceName, operation) {
        this._killPoller();
        const pollar = this.CloudPoll.poll({
            item: operation,
            pollFunction: opn => this.OperationApiService.get({ serviceName, operationId: opn.operationId }).$promise,
            stopCondition: opn => opn.state === this.LogStreamsConstants.FAILURE || opn.state === this.LogStreamsConstants.SUCCESS
        });
        return pollar;
    }
}

angular.module("managerApp").service("LogsStreamsService", LogsStreamsService);
