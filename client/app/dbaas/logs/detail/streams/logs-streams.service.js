class LogsStreamsService {
    constructor ($q, OvhApiDbaas, ServiceHelper) {
        this.$q = $q;
        this.ServiceHelper = ServiceHelper;
        this.LogsApiService = OvhApiDbaas.Logs().Lexi();
        this.StreamsApiService = OvhApiDbaas.Logs().Stream().Lexi();
        this.AccountingAapiService = OvhApiDbaas.Logs().Accounting().Aapi();
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
        return this.StreamsApiService.get({ serviceName, streamId }).$promise;
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
}

angular.module("managerApp").service("LogsStreamsService", LogsStreamsService);
