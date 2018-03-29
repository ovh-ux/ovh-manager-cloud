class LogsListService {
    constructor ($q, OvhApiDbaas, LogsHelperService, LogsTokensService, LogsHomeConstant) {
        this.$q = $q;
        this.LogsListApiService = OvhApiDbaas.Logs().Lexi();
        this.LogsHelperService = LogsHelperService;
        this.LogsTokensService = LogsTokensService;
        this.LogsHomeConstant = LogsHomeConstant;
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
            .catch(err => this.LogsHelperService.handleError("logs_accounts_get_accounts_error", err, {}));
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
            .catch(err => this.LogsHelperService.handleError("logs_accounts_get_detail_error", err, { accountName: serviceName }));
    }

    getQuota (service) {
        return this.AccountingAapiService.me({ serviceName: service.serviceName })
            .$promise
            .catch(err => this.LogsHelperService.handleError("logs_accounts_get_quota_error", err, { accountName: service.displayName || service.serviceName }));
    }

    /**
     * returns default cluster associated with user
     *
     * @param {any} serviceName
     * @returns promise which will be resolve to default cluster
     * @memberof LogsInputsService
     */
    getDefaultCluster (serviceName) {
        return this.LogsTokensService.getDefaultCluster(serviceName, "logs_accounts_get_entry_point_error");
    }

    _transformService (service) {
        if (this.LogsHelperService.isAccountDisabled(service)) {
            service.isDisabled = true;
        } else {
            service.isDisabled = false;
        }
        service.quota = {
            isLoadingQuota: true,
            offerType: "-"
        };
        service.cluster = {
            isLoadingCluster: true,
            hostname: "-"
        };
        this.getQuota(service)
            .then(me => {
                if (!_.isEmpty(me.total)) {
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
                    service.isBasicOffer = this.LogsHelperService.isBasicOffer(me);
                    service.quota.offerType = service.isBasicOffer ? "Basic" : "Pro";
                }
            })
            .finally(() => {
                service.quota.isLoadingQuota = false;
            });
        this.getDefaultCluster(service.serviceName)
            .then(cluster => {
                service.cluster.hostname = cluster.hostname;
            })
            .finally(() => {
                service.cluster.isLoadingCluster = false;
            });
        return service;
    }

    _resetAllCache () {
        this.TokenApiService.resetAllCache();
    }

}

angular.module("managerApp").service("LogsListService", LogsListService);
