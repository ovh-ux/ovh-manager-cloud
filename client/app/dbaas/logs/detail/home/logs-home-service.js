class LogsHomeService {
    constructor ($http, $q, $translate, LogsHelperService, LogsHomeConstant, LogsOfferConstant, LogsOptionsService, OvhApiDbaas, ServiceHelper, SidebarMenu) {
        this.$http = $http;
        this.$q = $q;
        this.$translate = $translate;
        this.AccountingAapiService = OvhApiDbaas.Logs().Accounting().Aapi();
        this.ContactsApiLexiService = OvhApiDbaas.Logs().Contacts().Lexi();
        this.DetailsAapiService = OvhApiDbaas.Logs().Details().Aapi();
        this.InputsApiAapiService = OvhApiDbaas.Logs().Input().Aapi();
        this.InputsApiLexiService = OvhApiDbaas.Logs().Input().Lexi();
        this.LogsLexiService = OvhApiDbaas.Logs().Lexi();
        this.LogsHelperService = LogsHelperService;
        this.LogsHomeConstant = LogsHomeConstant;
        this.LogsOfferConstant = LogsOfferConstant;
        this.LogsOptionsService = LogsOptionsService;
        this.OperationApiService = OvhApiDbaas.Logs().Operation().Lexi();
        this.ServiceHelper = ServiceHelper;
        this.SidebarMenu = SidebarMenu;
    }

    /**
     * Gets the transformed account object
     *
     * @param {any} serviceName
     * @returns promise which will resolve to the account object
     * @memberof LogsHomeService
     */
    getAccount (serviceName) {
        return this.AccountingAapiService.me({ serviceName }).$promise
            .then(account => this._transformAccount(account))
            .catch(this.ServiceHelper.errorHandler("logs_home_account_get_error"));
    }

    /**
     * Gets the transformed account details object
     *
     * @param {any} serviceName
     * @returns promise which will resolve to the account details object
     * @memberof LogsHomeService
     */
    getAccountDetails (serviceName) {
        return this.DetailsAapiService.me({ serviceName }).$promise
            .then(accountDetails => this._transformAccountDetails(accountDetails))
            .catch(this.ServiceHelper.errorHandler("logs_home_account_details_get_error"));
    }

    /**
     * Gets the current offer object
     *
     * @param {any} serviceName
     * @returns promise which will resolve to the current offer object
     * @memberof LogsHomeService
     */
    getCurrentOffer (serviceName) {
        return this.LogsOfferService.getOffer(serviceName)
            .then(offer => this._transformOffer(offer));
    }

    /**
     * Gets the data usage statistics data (number of documents and data received)
     *
     * @param {any} serviceName
     * @returns promise which will resolve with the statistics data
     * @memberof LogsHomeService
     */
    getDataUsage (serviceName) {
        return this.getAccount(serviceName)
            .then(account => {
                const token = btoa(account.metrics.token);
                const query = {
                    start: moment().subtract(this.LogsHomeConstant.DATA_STORAGE.TIME_PERIOD_MONTHS, "month").unix() * 1000,
                    queries: [{
                        metric: this.LogsHomeConstant.DATA_STORAGE.METRICS.SUM,
                        aggregator: this.LogsHomeConstant.DATA_STORAGE.AGGREGATORS.MAX,
                        downsample: this.LogsHomeConstant.DATA_STORAGE.DOWNSAMPLING_MODE["24H_MAX"]
                    },
                    {
                        metric: this.LogsHomeConstant.DATA_STORAGE.METRICS.COUNT,
                        aggregator: this.LogsHomeConstant.DATA_STORAGE.AGGREGATORS.MAX,
                        downsample: this.LogsHomeConstant.DATA_STORAGE.DOWNSAMPLING_MODE["24H_MAX"]
                    }]
                };
                return this.$http({
                    method: "POST",
                    url: `${account.metrics.host}/api/query`,
                    headers: {
                        Authorization: `Basic ${token}`
                    },
                    preventLogout: true,
                    data: JSON.stringify(query)
                });
            })
            .then(data => {
                const timestamps = data.data.length > 0 ? Object.keys(data.data[0].dps) : [];
                data = data.data.map(dat => timestamps.map(timestamp => dat.dps[timestamp]));
                return {
                    timestamps: timestamps.map(timestamp => timestamp * 1000),
                    usageData: data
                };
            })
            .catch(this.ServiceHelper.errorHandler("logs_home_data_get_error"));
    }

    /**
     * Gets the cold storage data volume
     *
     * @param {any} serviceName
     * @returns promise which will resolve with the data volume
     * @memberof LogsHomeService
     */
    getColdstorage = function (serviceName) {
        return this.getAccount(serviceName)
            .then(account => {
                const token = btoa(account.metrics.token);
                return this.$http({
                    method: "GET",
                    url: `${account.metrics.host}/api/query/last`,
                    params: { timeseries: this.LogsHomeConstant.DATA_STORAGE.METRICS.COLD_STORAGE_TOTAL },
                    headers: {
                        Authorization: `Basic ${token}`
                    },
                    preventLogout: true
                }).then(data => ({ coldStorage: data.data.length > 0 ? Math.floor(data.data[0].value) : undefined }));
            });
    };

    /**
     * Gets the currently subscribed options
     *
     * @param {any} serviceName
     * @returns promise which will resolve to the array of subscribed options
     * @memberof LogsHomeService
     */
    getOptions (serviceName) {
        return this.LogsOptionsService.getSubscribedOptionsMap(serviceName)
            .then(options => {
                options.forEach(option => this._transformOption(option));
                return options;
            });
    }

    /**
     * Gets the service info
     *
     * @param {any} serviceName
     * @returns promise which will resolve to the service info
     * @memberof LogsHomeService
     */
    getServiceInfos (serviceName) {
        return this.LogsLexiService.serviceInfos({ serviceName }).$promise
            .catch(this.ServiceHelper.errorHandler("logs_home_service_info_get_error"));
    }

    /**
     * Gets the service details
     *
     * @param {any} serviceName
     * @returns promise which will resolve to the service details
     * @memberof LogsHomeService
     */
    getServiceDetails (serviceName) {
        return this.LogsLexiService.logDetail({ serviceName })
            .$promise
            .catch(this.ServiceHelper.errorHandler("logs_get_error"));
    }

    /**
     * Converts the number to a more readable form
     *
     * @param {any} number
     * @returns the number in more readable form
     * @memberof LogsHomeService
     */
    humanizeNumber (number) {
        if (number < 1000) {
            return Math.round(number * 100) / 100;
        }
        const si = ["K", "M", "G", "T", "P", "H"];
        const exp = Math.floor(Math.log(number) / Math.log(1000));
        let result = number / 1000 ** exp;
        result = result % 1 > (1 / (1000 ** (exp - 1))) ? Math.round(result.toFixed(2) * 100) / 100 : result.toFixed(0);
        return result + si[exp - 1];
    }

    /**
     * Updates the current display name information
     *
     * @param {any} serviceName
     * @param {string} displayName
     * @returns promise which will resolve or reject once the operation is complete
     * @memberof LogsHomeService
     */
    updateDisplayName (serviceName, displayName) {
        return this.LogsLexiService.update({ serviceName }, { displayName })
            .$promise.then(operation => {
                this._resetAllCache();
                return this.LogsHelperService.handleOperation(serviceName, operation.data || operation, "logs_home_display_name_update_success", { })
                    .then(res => {
                        this._changeMenuTitle(serviceName, displayName || serviceName);
                        return res;
                    });
            })
            .catch(err => this.LogsHelperService.handleError("logs_home_display_name_update_error", err, { }));
    }

    /**
     * Finds and returns a url from a list of urls based on it's type
     *
     * @param {any} urls the list of urls
     * @param {string} type the type of url that has to be retrieved
     * @returns the found url
     * @memberof LogsHomeService
     */
    _findUrl (urls, type) {
        return urls.reduce((foundUrl, url) => url.type === type ? url.address : foundUrl, "");
    }

    /**
     * Gets the Elasticsearch url from the object
     *
     * @param {any} object the object with urls
     * @returns the Elasticsearch url
     * @memberof LogsHomeService
     */
    _getElasticSearchApiUrl (object) {
        const elasticSearchApiUrl = this._findUrl(object.urls, this.LogsHomeConstant.URLS.ELASTICSEARCH_API);
        object.elasticSearchApiUrl = `${elasticSearchApiUrl}/_cluster/health?pretty=true`;
        return object;
    }

    /**
     * Gets the Greylog API url from the object
     *
     * @param {any} object the object with urls
     * @returns the Greylog API url
     * @memberof LogsHomeService
     */
    _getGreyLogApiUrl (object) {
        object.graylogApiUrl = this._findUrl(object.urls, this.LogsHomeConstant.URLS.GRAYLOG_API);
        return object;
    }

    /**
     * Gets the Greylog url from the object
     *
     * @param {any} object the object with urls
     * @returns the Greylog url
     * @memberof LogsHomeService
     */
    _getGreyLogUrl (object) {
        object.graylogWebuiUrl = this._findUrl(object.urls, this.LogsHomeConstant.URLS.GRAYLOG_WEBUI);
        return object;
    }

    /**
     * Builds and returns the ports and messages information from the account details object
     *
     * @param {any} accountDetails
     * @returns the ports and messages information
     * @memberof LogsHomeService
     */
    _getPortsAndMessages (accountDetails) {
        const portsAndMessages = {};
        accountDetails.urls.forEach(url => {
            const urlInfo = this.LogsHomeConstant.URL_TYPES[url.type];
            if (urlInfo) {
                portsAndMessages[urlInfo.PORT] = portsAndMessages[urlInfo.PORT] ||
                    { name: this.LogsHomeConstant.PORT_TYPES[urlInfo.PORT] };
                portsAndMessages[urlInfo.PORT][urlInfo.MESSAGE] = url.address.split(":")[1];
            }
        });
        return Object.keys(portsAndMessages).map(portType => portsAndMessages[portType]);
    }

    /**
     * Resets all relevant caches
     *
     * @memberof LogsHomeService
     */
    _resetAllCache () {
        this.DetailsAapiService.resetAllCache();
        this.LogsLexiService.resetAllCache();
    }

    /**
     * Returns the transformed account object
     *
     * @param {any} account
     * @returns the transformed account object
     * @memberof LogsHomeService
     */
    _transformAccount (account) {
        if (_.isEmpty(account.offer)) {
            account.offer.description = "";
        } else if (account.offer.reference === this.LogsOfferConstant.basicOffer) {
            account.offer.description = this.LogsOfferConstant.offertypes.BASIC;
        } else {
            const dataVolume = this.$translate.instant("logs_home_data_volume");
            const dataVolumeValue = this.$translate.instant(account.offer.reference);
            account.offer.description = `${this.LogsOfferConstant.offertypes.PRO} - ${dataVolume}: ${dataVolumeValue}`;
        }
        return account;
    }

    /**
     * Returns the transformed account details object
     *
     * @param {any} accountDetails
     * @returns the transformed account detials object
     * @memberof LogsHomeService
     */
    _transformAccountDetails (accountDetails) {
        accountDetails.email = accountDetails.service.contact ? accountDetails.service.contact.email : accountDetails.me.email;
        this._getGreyLogUrl(accountDetails);
        this._getGreyLogApiUrl(accountDetails);
        accountDetails.graylogApiUrl = `${accountDetails.graylogApiUrl}/api-browser`;
        accountDetails.graylogEntryPoint = accountDetails.graylogWebuiUrl.replace("https://", "").replace("/api", "");
        this._getElasticSearchApiUrl(accountDetails);
        if (accountDetails.last_stream) { this._getGreyLogUrl(accountDetails.last_stream); }
        if (accountDetails.last_dashboard) { this._getGreyLogUrl(accountDetails.last_dashboard); }
        accountDetails.portsAndMessages = this._getPortsAndMessages(accountDetails);
        return accountDetails;
    }

    /**
     * Returns the transformed option object
     *
     * @param {any} option
     * @returns the transformed option object
     * @memberof LogsHomeService
     */
    _transformOption (option) {
        option.description = `${option.quantity} ${option.type}: ${option.detail}`;
        return option;
    }

    /**
     * Sets the menu's title
     *
     * @param {any} serviceName
     * @param {any} displayName
     * @memberof LogsHomeService
     */
    _changeMenuTitle (serviceName, displayName) {
        const menuItem = this.SidebarMenu.getItemById(serviceName);
        if (menuItem) {
            menuItem.title = displayName;
        }
    }
}

angular.module("managerApp").service("LogsHomeService", LogsHomeService);
