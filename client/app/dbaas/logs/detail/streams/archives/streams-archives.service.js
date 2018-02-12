class LogsStreamsArchivesService {
    constructor ($http, $q, LogsStreamsArchivesConstant, OvhApiDbaas, ServiceHelper) {
        this.$http = $http;
        this.$q = $q;
        this.LogsStreamsArchivesConstant = LogsStreamsArchivesConstant;
        this.ArchivesApiService = OvhApiDbaas.Logs().Archive().Lexi();
        this.ServiceHelper = ServiceHelper;
    }

    _transformArchive (archive) {
        archive.retrievalStateInfo = this.LogsStreamsArchivesConstant.stateInfo[archive.retrievalState];
    }

    _getDownloadUrl (serviceName, streamId, archive) {
        return this.ArchivesApiService.url({
            serviceName,
            streamId,
            archiveId: archive.archiveId,
            expirationInSeconds: this.LogsStreamsArchivesConstant.expirationInSeconds
        }).$promise.then(response => response.data)
            .catch(this.ServiceHelper.errorHandler("streams_archives_url_load_error"));
    }

    downloadArchive (serviceName, streamId, archive) {
        return this._getDownloadUrl(serviceName, streamId, archive)
            .then(urlInfo => {
                return this.$http.get(urlInfo.url, { responseType: "blob" });
            })
            .then(response => {
                console.log(response);
            })
            .catch(response => {
                debugger;
                console.log(response);
            });
    }

    /**
     * Get the IDs of all archives
     *
     * @param {any} serviceName
     * @param {any} streamId
     * @returns promise which will be resolve with a list of archive IDs
     * @memberof LogsStreamsArchivesService
     */
    getArchiveIds (serviceName, streamId) {
        return this.ArchivesApiService.query({
            serviceName,
            streamId
        }).$promise
            .catch(this.ServiceHelper.errorHandler("streams_archives_ids_loading_error"));
    }

    /**
     * Gets the archive objects corresponding to the archiveIds
     *
     * @param {any} serviceName
     * @param {any} streamId
     * @param {any} archiveIds - list of archive IDs for which archive object is to be fetched
     * @returns promise which will be resolve with the list of archives
     * @memberof LogsStreamsArchivesService
     */
    getArchives (serviceName, streamId, archiveIds) {
        return this.getArchiveDetails(serviceName, streamId, archiveIds)
            .then(archives => {
                archives.forEach(archive => this._transformArchive(archive));
                return archives;
            })
            .catch(this.ServiceHelper.errorHandler("streams_archives_loading_error"));
    }

    /**
     * Gets the archive objects corresponding to the archiveIds
     *
     * @param {any} serviceName
     * @param {any} streamId
     * @param {any} archiveIds - list of archive IDs for which archive object is to be fetched
     * @returns promise which will be resolve with the list of archives
     * @memberof LogsStreamsArchivesService
     */
    getArchiveDetails (serviceName, streamId, archiveIds) {
        const promises = archiveIds.map(archiveId => this.getArchive(serviceName, streamId, archiveId));
        return this.$q.all(promises);
    }

    /**
     * Gets the archive object corresponding to the archiveId
     *
     * @param {any} serviceName
     * @param {any} streamId
     * @param {any} archiveId - the archive ID for which archive object is to be fetched
     * @returns promise which will resolve with the archive
     * @memberof LogsStreamsArchivesService
     */
    getArchive (serviceName, streamId, archiveId) {
        return this.ArchivesApiService.get({ serviceName, streamId, archiveId }).$promise;
    }
}

angular.module("managerApp").service("LogsStreamsArchivesService", LogsStreamsArchivesService);
