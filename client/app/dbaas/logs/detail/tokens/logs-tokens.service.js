class LogsTokensService {
    constructor ($q, $translate, OvhApiDbaas, ServiceHelper, CloudPoll, LogStreamsConstants) {
        this.$q = $q;
        this.ServiceHelper = ServiceHelper;
        this.TokenApiService = OvhApiDbaas.Logs().Token().Lexi();
        this.CloudPoll = CloudPoll;
        this.LogStreamsConstants = LogStreamsConstants;
        this.OperationApiService = OvhApiDbaas.Logs().Operation().Lexi();
        this.DetailsAapiService = OvhApiDbaas.Logs().Details().Aapi();
    }

    /**
     * returns array of tokens with details
     *
     * @param {any} serviceName
     * @returns promise which will be resolve to array of tokens. Each alias will have all details populated.
     * @memberof LogsTokensService
     */
    getTokens (serviceName) {
        return this.getTokensDetails(serviceName)
            .catch(err => this._handleError("logs_tokens_get_error", err, {}));
    }

    /**
     * gets details for each token in array
     *
     * @param {any} serviceName
     * @returns promise which will be resolve to an array of token objects
     * @memberof LogsTokensService
     */
    getTokensDetails (serviceName) {
        return this.getTokensIds(serviceName)
            .then(tokens => {
                const promises = tokens.map(tokenId => this.getToken(serviceName, tokenId));
                return this.$q.all(promises);
            });
    }

    /**
     * returns array of tokens id's of logged in user
     *
     * @param {any} serviceName
     * @returns promise which will be resolve to array of tokens id's
     * @memberof LogsTokensService
     */
    getTokensIds (serviceName) {
        return this.TokenApiService.query({ serviceName }).$promise;
    }

    /**
     * returns details of an token
     *
     * @param {any} serviceName
     * @param {any} tokenId
     * @returns promise which will be resolve to token object
     * @memberof LogsTokensService
     */
    getToken (serviceName, tokenId) {
        return this.TokenApiService.get({ serviceName, tokenId })
            .$promise.catch(this.ServiceHelper.errorHandler("logs_tokens_get_detail_error"));
    }

    /**
     * delete token
     *
     * @param {any} serviceName
     * @param {any} token, token object to be deleted
     * @returns promise which will be resolve to operation object
     * @memberof LogsTokensService
     */
    deleteToken (serviceName, token) {
        return this.TokenApiService.delete({ serviceName, tokenId: token.tokenId })
            .$promise
            .then(operation => {
                this._resetAllCache();
                return this._handleSuccess(serviceName, operation.data || operation, "logs_tokens_delete_success", { tokenName: token.name });
            })
            .catch(err => this._handleError("logs_tokens_delete_error", err, { tokenName: token.name }));
    }

    /**
     * create new token
     *
     * @param {any} serviceName
     * @param {any} token, token object to be created
     * @returns promise which will be resolve to operation object
     * @memberof LogsTokensService
     */
    createToken (serviceName, token) {
        return this.TokenApiService.create({ serviceName }, token)
            .$promise
            .then(operation => {
                this._resetAllCache();
                return this._handleSuccess(serviceName, operation.data || operation, "logs_tokens_create_success", { tokenName: token.name });
            })
            .catch(err => this._handleError("logs_tokens_create_error", err, { tokenName: token.name }));
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
            .catch(this.ServiceHelper.errorHandler("logs_tokens_cluster_get_error"));
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
     * @memberof LogsTokensService
     */
    getNewToken (serviceName) {
        return this.getDefaultCluster(serviceName).then(defaultCluster => ({
            name: null,
            clusterId: defaultCluster ? defaultCluster.clusterId : null
        }));
    }

    _killPoller () {
        if (this.poller) {
            this.poller.kill();
        }
    }

    _resetAllCache () {
        this.TokenApiService.resetAllCache();
    }

    _pollOperation (serviceName, operation) {
        this._killPoller();
        return this.CloudPoll.poll({
            item: operation,
            pollFunction: opn => this.OperationApiService.get({ serviceName, operationId: opn.operationId }).$promise,
            stopCondition: opn => opn.state === this.LogStreamsConstants.FAILURE || opn.state === this.LogStreamsConstants.SUCCESS || opn.state === this.LogStreamsConstants.REVOKED
        });
    }

    /**
     * handles error state for create, delete and update input
     *
     * @param {any} errorMessage, message to show on UI
     * @param {any} error, the error object
     * @param {any} messageData, the data to be used in the error message
     * @memberof LogsInputsService
     */
    _handleError (errorMessage, error, messageData) {
        return this.ServiceHelper.errorHandler(errorMessage)({ data: _.assign(messageData, error.data) });
    }

    /**
     * handles success state for create, delete and update inputs.
     * Repetedly polls for operation untill it returns SUCCESS message.
     *
     * @param {any} serviceName
     * @param {any} operation, operation to poll
     * @param {any} successMessage, message to show on UI
     * @param {any} messageData, the data to be used in the success message
     * @returns promise which will be resolved to operation object
     * @memberof LogsInputsService
     */
    _handleSuccess (serviceName, operation, successMessage, messageData) {
        return this._pollOperation(serviceName, operation)
            .$promise.then(successData => {
                if (successMessage) {
                    this.ServiceHelper.successHandler(successMessage)(messageData);
                }
                return successData;
            });
    }
}

angular.module("managerApp").service("LogsTokensService", LogsTokensService);
