class LogsStreamsArchivesCtrl {
    constructor ($interval, $state, $stateParams, $translate, CloudMessage, ControllerHelper, LogsStreamsService, LogsConstants, LogsStreamsArchivesService) {
        this.$interval = $interval;
        this.$state = $state;
        this.$stateParams = $stateParams;
        this.$translate = $translate;
        this.CloudMessage = CloudMessage;
        this.ControllerHelper = ControllerHelper;
        this.LogsStreamsService = LogsStreamsService;
        this.LogsConstants = LogsConstants;
        this.LogsStreamsArchivesService = LogsStreamsArchivesService;

        this.serviceName = this.$stateParams.serviceName;
        this.streamId = this.$stateParams.streamId;
        this._initLoaders();
    }

    $onInit () {
        this.archiveIds.load();
        this.stream.load();
        this.notifications = [];
    }

    $destroy () {
        this._stopRetrievalDelayUpdate();
    }

    /**
     * Gets the notificaiton index for an archive if available
     *
     * @param {any} archive
     * @returns the notification index. Returns -1 if not found
     * @memberof LogsStreamsArchivesHomeCtrl
     */
    _getNotificationIndex (archive) {
        return this.notifications.reduce((matchedIndex, currentNotification, currentIndex) => currentNotification.archive.archiveId === archive.archiveId ? currentIndex : matchedIndex, -1);
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
     * Updates the list of archive with the latest information of the archive
     *
     * @param {any} archiveId
     * @returns promise which will be resolve with the reloaded archive
     * @memberof LogsStreamsArchivesHomeCtrl
     */
    _reloadArchiveDetail (archiveId) {
        this.archiveReload = this.ControllerHelper.request.getArrayLoader({
            loaderFunction: () => this.LogsStreamsArchivesService.getArchives(
                this.serviceName,
                this.streamId,
                [archiveId]
            )
        });

        return this.archiveReload.load()
            .then(archives => {
                const archive = archives[0];
                this.archives.data.forEach((archiveItem, archiveIndex) => {
                    if (archiveItem.archiveId === archive.archiveId) {
                        this.archives.data[archiveIndex] = archive;
                    }
                });
                return archive;
            });
    }

    /**
     * Removes the notification for an archive if available
     *
     * @param {any} archive
     * @returns Returns the removed notification
     * @memberof LogsStreamsArchivesHomeCtrl
     */
    _removeNotification (archive) {
        const notificationIndex = this._getNotificationIndex(archive);
        return this.notifications.splice(notificationIndex, notificationIndex >= 0 ? 1 : 0);
    }

    /**
     * Starts an interval that runs every second, that updates
     * the remaining unsealing time for all archives being unsealed
     *
     * @memberof LogsStreamsArchivesHomeCtrl
     */
    _startRetrievalDelayUpdate () {
        this.retrievalDelayUpdater = this.$interval(() => this._updateRetrievalDelay(), 1000);
    }

    /**
     * Stops the interval that updates the remaining unsealing
     * time for all archives being unsealed
     *
     * @memberof LogsStreamsArchivesHomeCtrl
     */
    _stopRetrievalDelayUpdate () {
        this.$interval.cancel(this.retrievalDelayUpdater);
    }

    /**
     * Updates the notification for an archive if available. Else adds the notification
     *
     * @param {any} archive
     * @param {any} notification
     * @returns Returns the updated/inserted notification
     * @memberof LogsStreamsArchivesHomeCtrl
     */
    _updateNotification (notification) {
        const notificationIndex = this._getNotificationIndex(notification.archive);
        return notificationIndex >= 0 ? (this.notifications[notificationIndex] = notification) : (this.notifications.push(notification));
    }

    /**
     * Loops through all archives and reduces the remaining unsealing
     * time for archives being unsealed. Also sets an archive to available
     * when the unsealing is complete and issues a notification
     *
     * @memberof LogsStreamsArchivesHomeCtrl
     */
    _updateRetrievalDelay () {
        _.clone(this.notifications).forEach(notification => {
            const archive = notification.archive;
            archive.retrievalDelay = archive.retrievalDelay > 0 ? --archive.retrievalDelay : archive.retrievalDelay;
            if (archive.retrievalState === this.LogsConstants.state.UNSEALING) {
                if (archive.retrievalDelay === 0) {
                    archive.retrievalState = this.LogsConstants.state.UNSEALED;
                    this.LogsStreamsArchivesService.transformArchive(archive);
                }
                this._updateUnfreezingNotification(archive);
            }
        });
    }

    /**
     * Updates the notification for an archive that is being unsealed.
     * If the archive is not being unsealed, the notification is removed
     *
     * @param {any} archive
     * @returns Returns the updated/removed notification
     * @memberof LogsStreamsArchivesHomeCtrl
     */
    _updateUnfreezingNotification (archive) {
        return archive.retrievalState === this.LogsConstants.state.UNSEALING ?
            [this._updateNotification({
                text: this.$translate.instant("streams_archives_unfreezing", {
                    name: archive.filename,
                    time: moment.utc(archive.retrievalDelay * 1000).format("HH:mm:ss")
                }),
                type: "info",
                archive
            })] :
            this._removeNotification(archive);
    }

    /**
     * Gets the URL for an archive and downloads it
     *
     * @param {any} archive
     * @memberof LogsStreamsArchivesHomeCtrl
     */
    download (archive) {
        this._updateNotification({
            text: this.$translate.instant("streams_archives_preparing_download", {
                filename: archive.filename
            }),
            type: "info",
            archive
        });
        this.ControllerHelper.scrollPageToTop();
        this.archiveDownload = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () => this.LogsStreamsArchivesService.getDownloadUrl(this.serviceName, this.streamId, archive.archiveId)
        });

        this.archiveDownload.load()
            .then(urlInfo => {
                this._removeNotification(archive);
                this.ControllerHelper.downloadUrl(urlInfo.url);
            });
    }

    /**
     * Loads a number of archives specified by the pageSize, starting from the specified offset
     * Also issues a notification for archives being unsealed
     *
     * @param {any} offset
     * @param {any} pageSize
     * @returns promise which will be resolve to the loaded archives data
     * @memberof LogsStreamsArchivesHomeCtrl
     */
    loadArchives ({ offset, pageSize }) {
        this._stopRetrievalDelayUpdate();
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
            }))
            .then(this._startRetrievalDelayUpdate())
            .then(archivesData => {
                archivesData.data.forEach(archive => this._updateUnfreezingNotification(archive));
                return archivesData;
            });
    }

    /**
     * Starts the unsealing process for an archive and issues a notification
     * with the remaining time after which the archive would be available for download
     *
     * @param {any} archive
     * @memberof LogsStreamsArchivesHomeCtrl
     */
    unfreeze (archive) {
        this._updateNotification({
            text: this.$translate.instant("streams_archives_unfreeze_start", {
                filename: archive.filename
            }),
            type: "info",
            archive
        });
        this.ControllerHelper.scrollPageToTop();
        this.LogsStreamsArchivesService.getDownloadUrl(
            this.serviceName,
            this.streamId,
            archive.archiveId
        )
            .then(() => this._reloadArchiveDetail(archive.archiveId))
            .then(updatedArchive => this._updateUnfreezingNotification(updatedArchive))
            .catch(err => {
                this._updateNotification({
                    text: this.$translate.instant("streams_archives_url_load_error", {
                        filename: archive.filename,
                        message: err
                    }),
                    type: "error",
                    archive
                });
            });
    }
}

angular.module("managerApp").controller("LogsStreamsArchivesCtrl", LogsStreamsArchivesCtrl);
