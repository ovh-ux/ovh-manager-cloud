class LogsListService {
    constructor ($q, OvhApiDbaas, LogsHelperService, LogsStreamsService) {
        this.$q = $q;
        this.LogsListApiService = OvhApiDbaas.Logs().Lexi();
        this.LogsHelperService = LogsHelperService;
        this.LogsStreamsService = LogsStreamsService;
        this.AccountingAapiService = OvhApiDbaas.Logs().Accounting().Aapi();
    }

    /**
     * returns array of accounts with details
     *
     * @returns promise which will be resolve to array of accounts. Each account will have all details populated.
     * @memberof LogsListService
     */
    getServices () {
        return this.getServicesDetails()
            .catch(err => this.LogsHelperService.handleError("logs_tokens_get_error", err, {}));
    }

    /**
     * gets details for each account in array
     *
     * @returns promise which will be resolve to an array of account objects
     * @memberof LogsListService
     */
    getServicesDetails () {
        return this.getServicesIds()
            .then(accounts => {
                const promises = accounts.map(serviceName => this.getService(serviceName));
                return this.$q.all(promises);
            });
    }

    /**
     * returns array of id's of all accounts
     *
     * @returns promise which will be resolve to array of accounts id's
     * @memberof LogsListService
     */
    getServicesIds () {
        return this.LogsListApiService.query().$promise;
    }

    /**
     * returns details of an account
     *
     * @param {any} accountId
     * @returns promise which will be resolve to account object
     * @memberof LogsListService
     */
    getService (serviceName) {
        return this.LogsListApiService.logDetail({ serviceName })
            .$promise
            .then(service => this._transformService(service))
            .catch(err => this.LogsHelperService.handleError("logs_accounts_get_detail_error", err, {}));
    }

    getQuota (serviceName) {
        return this.AccountingAapiService.me({ serviceName })
            .$promise
            .catch(err => this.LogsHelperService.handleError("logs_streams_quota_get_error", err, {}));
    }

    _transformService (service) {
        service.quota = {
            isLoadingQuota: true
        };
        this.getQuota(service.serviceName)
            .then(me => {
                service.quota.streams = {
                    current: me.total.curNbStream,
                    max: me.total.maxNbStream
                };
                service.quota.indices = {
                    current: me.total.curNbIndex,
                    max: me.total.maxNbIndex
                };
                service.quota.dashboards = {
                    current: me.total.curNbDashboard,
                    max: me.total.maxNbDashboard
                };
                service.quota.offerType = me.offer.reference.startsWith("logs-pro") ? "Pro" : "Basic";
                service.quota.isLoadingQuota = false;
            });
        return service;
    }

    /**
     * returns array of Input IDs of logged in user
     *
     * @param {any} serviceName
     * @returns promise which will be resolve to array of input IDs
     * @memberof LogsInputsService
     */
    getClusters (serviceName) {
        return this.DetailsAapiService.me({ serviceName })
            .$promise
            .then(details => details.clusters)
            .catch(err => this.LogsHelperService.handleError("logs_tokens_cluster_get_error", err, {}));
    }

    /**
     * returns default cluster associated with user
     *
     * @param {any} serviceName
     * @returns promise which will be resolve to default cluster
     * @memberof LogsInputsService
     */
    getDefaultCluster (serviceName) {
        return this.getClusters(serviceName)
            .then(clusters => {
                const defaultClusters = clusters.filter(cluster => cluster.isDefault);
                return defaultClusters.length > 0 ? defaultClusters[0] : null;
            });
    }

    /**
     * creates new token with default values
     *
     * @returns token object with default values
     * @memberof LogsListService
     */
    getNewToken (serviceName) {
        return this.getDefaultCluster(serviceName).then(defaultCluster => ({
            name: null,
            clusterId: defaultCluster ? defaultCluster.clusterId : null
        }));
    }

    _resetAllCache () {
        this.TokenApiService.resetAllCache();
    }

}

angular.module("managerApp").service("LogsListService", LogsListService);
