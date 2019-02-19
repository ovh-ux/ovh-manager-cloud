class LogsAliasesService {
  constructor($q, $translate, OvhApiDbaas, ServiceHelper, CucCloudPoll, LogsHelperService,
    LogsOptionsService, LogsConstants, UrlHelper, CucCloudMessage, LogsStreamsService,
    LogsIndexService) {
    this.$q = $q;
    this.$translate = $translate;
    this.ServiceHelper = ServiceHelper;
    this.AliasApiService = OvhApiDbaas.Logs().Alias().v6();
    this.AliasAapiService = OvhApiDbaas.Logs().Alias().Aapi();
    this.AccountingAapiService = OvhApiDbaas.Logs().Accounting().Aapi();
    this.OperationApiService = OvhApiDbaas.Logs().Operation().v6();
    this.CucCloudPoll = CucCloudPoll;
    this.LogsHelperService = LogsHelperService;
    this.LogsOptionsService = LogsOptionsService;
    this.LogsConstants = LogsConstants;
    this.UrlHelper = UrlHelper;
    this.CucCloudMessage = CucCloudMessage;
    this.LogsStreamsService = LogsStreamsService;
    this.LogsIndexService = LogsIndexService;

    this.contentTypeEnum = _.indexBy(['STREAMS', 'INDICES']);
    this.contents = [
      { value: this.contentTypeEnum.STREAMS, name: 'logs_streams_title' },
      { value: this.contentTypeEnum.INDICES, name: 'logs_index_title' },
    ];
  }

  getContents() {
    return this.contents;
  }

  /**
   * returns array of aliases with details
   *
   * @param {any} serviceName
   * @returns promise which will be resolve to array of aliases.
   *          Each alias will have all details populated.
   * @memberof LogsAliasesService
   */
  getAliases(serviceName) {
    return this.getAliasesDetails(serviceName)
      .catch(err => this.LogsHelperService.handleError('logs_aliases_get_error', err, {}));
  }

  /**
   * returns array of owned aliases with details of logged in user
   *
   * @param {any} serviceName
   * @returns promise which will be resolve to array of aliases.
   *          Each stream will have all details populated.
   * @memberof LogsStreamsService
   */
  getOwnAliases(serviceName) {
    return this.getAliasesDetails(serviceName)
      .then(aliases => aliases.filter(alias => alias.info.isEditable))
      .catch(err => this.LogsHelperService.handleError('logs_aliases_get_error', err, {}));
  }

  /**
   * returns array of shareable aliases with details of logged in user
   *
   * @param {any} serviceName
   * @returns promise which will be resolve to array of aliases.
   *          Each stream will have all details populated.
   * @memberof LogsStreamsService
   */
  getShareableAliases(serviceName) {
    return this.getAliasesDetails(serviceName)
      .then(aliases => aliases.filter(alias => alias.info.isShareable))
      .catch(err => this.LogsHelperService.handleError('logs_aliases_get_error', err, {}));
  }

  /**
   * gets details for each alias in array
   *
   * @param {any} serviceName
   * @returns promise which will be resolve to an array of alias objects
   * @memberof LogsAliasesService
   */
  getAliasesDetails(serviceName) {
    return this.getAliasesIds(serviceName)
      .then((aliases) => {
        const promises = aliases.map(aliasId => this.getAapiAlias(serviceName, aliasId));
        return this.$q.all(promises);
      });
  }

  /**
   * returns array of aliases id's of logged in user
   *
   * @param {any} serviceName
   * @returns promise which will be resolve to array of aliases id's
   * @memberof LogsAliasesService
   */
  getAliasesIds(serviceName) {
    return this.AliasApiService.query({ serviceName }).$promise;
  }

  /**
   * returns details of an alias
   *
   * @param {any} serviceName
   * @param {any} aliasId
   * @returns promise which will be resolve to alias object
   * @memberof LogsAliasesService
   */
  getAlias(serviceName, aliasId) {
    return this.AliasApiService.get({ serviceName, aliasId })
      .$promise.catch(err => this.LogsHelperService.handleError('logs_alias_get_error', err, {}));
  }

  getAliasWithStreamsAndIndices(serviceName, aliasId) {
    return this.AliasAapiService.get({ serviceName, aliasId })
      .$promise
      .then((alias) => {
        if (alias.streams.length > 0) {
          const promises = alias.streams
            .map(streamId => this.LogsStreamsService.getAapiStream(serviceName, streamId));
          return this.$q.all(promises).then((streams) => {
            _.set(alias, 'streams', streams);
            return alias;
          });
        } if (alias.indexes.length > 0) {
          const promises = alias.indexes
            .map(indexId => this.LogsIndexService.getIndexDetails(serviceName, indexId));
          return this.$q.all(promises).then((indices) => {
            _.set(alias, 'indexes', indices);
            return alias;
          });
        }
        return alias;
      })
      .catch(err => this.LogsHelperService.handleError('logs_alias_get_error', err, {}));
  }

  /**
   * returns details of an alias
   *
   * @param {any} serviceName
   * @param {any} aliasId
   * @returns promise which will be resolve to alias object
   * @memberof LogsAliasesService
   */
  getAapiAlias(serviceName, aliasId) {
    return this.AliasAapiService.get({ serviceName, aliasId })
      .$promise.catch(err => this.LogsHelperService.handleError('logs_alias_get_error', err, {}));
  }

  /**
   * returns objecy containing total number of aliases and total number of aliases used
   *
   * @param {any} serviceName
   * @returns quota object containing max (total number aliases)
   *          and configured (number of aliases used)
   * @memberof LogsAliasesService
   */
  getQuota(serviceName) {
    return this.AccountingAapiService.me({ serviceName }).$promise
      .then(me => ({
        max: me.total.maxNbAlias,
        configured: me.total.curNbAlias,
      })).catch(err => this.LogsHelperService.handleError('logs_alias_quota_get_error', err, {}));
  }

  getMainOffer(serviceName) {
    return this.AccountingAapiService.me({ serviceName }).$promise
      .then(me => ({
        max: me.offer.maxNbAlias,
        current: me.offer.curNbAlias,
      }))
      .catch(err => this.LogsHelperService.handleError('logs_main_offer_get_error', err, {}));
  }

  /**
   * delete alias
   *
   * @param {any} serviceName
   * @param {any} alias, alias object to be deleted
   * @returns promise which will be resolve to operation object
   * @memberof LogsAliasesService
   */
  deleteAlias(serviceName, alias) {
    return this.AliasApiService.delete({ serviceName, aliasId: alias.aliasId }, alias)
      .$promise
      .then((operation) => {
        this.resetAllCache();
        return this.LogsHelperService.handleOperation(serviceName, operation.data || operation, 'logs_aliases_delete_success', { aliasName: alias.name });
      })
      .catch(err => this.LogsHelperService.handleError('logs_aliases_delete_error', err, { aliasName: alias.name }));
  }

  /**
   * create new alias
   *
   * @param {any} serviceName
   * @param {any} alias, alias object to be created
   * @returns promise which will be resolve to operation object
   * @memberof LogsAliasesService
   */
  createAlias(serviceName, alias) {
    return this.AliasApiService.create({ serviceName }, alias)
      .$promise
      .then((operation) => {
        this.resetAllCache();
        return this.LogsHelperService.handleOperation(serviceName, operation.data || operation, 'logs_aliases_create_success', { aliasName: alias.suffix });
      })
      .catch(err => this.LogsHelperService.handleError('logs_aliases_create_error', err, { aliasName: alias.suffix }));
  }

  /**
   * update alias
   *
   * @param {any} serviceName
   * @param {any} alias, alias object to be updated
   * @returns promise which will be resolve to operation object
   * @memberof LogsAliasesService
   */
  updateAlias(serviceName, alias) {
    return this.AliasApiService.update({ serviceName, aliasId: alias.aliasId }, alias)
      .$promise
      .then((operation) => {
        this.resetAllCache();
        return this.LogsHelperService.handleOperation(serviceName, operation.data || operation, 'logs_aliases_update_success', { aliasName: alias.name });
      })
      .catch(err => this.LogsHelperService.handleError('logs_aliases_update_error', err, { aliasName: alias.name }));
  }

  attachStream(serviceName, alias, stream) {
    return this.AliasApiService.linkStream({ serviceName, aliasId: alias.aliasId }, stream)
      .$promise
      .then(operation => this.LogsHelperService.handleOperation(
        serviceName,
        operation.data || operation,
        stream.indexingEnabled ? null : 'logs_aliases_attach_stream_not_indexed',
        { streamName: stream.title },
      ))
      .catch(err => this.LogsHelperService.handleError('logs_aliases_attach_stream_error', err, { streamName: stream.title }));
  }

  detachStream(serviceName, alias, stream) {
    return this.AliasApiService
      .unlinkStream({ serviceName, aliasId: alias.aliasId, streamId: stream.streamId })
      .$promise
      .then(operation => this.LogsHelperService.handleOperation(
        serviceName,
        operation.data || operation,
      ))
      .catch(err => this.LogsHelperService.handleError('logs_aliases_detach_stream_error', err, { streamName: stream.title }));
  }

  attachIndex(serviceName, alias, index) {
    return this.AliasApiService.linkIndex({ serviceName, aliasId: alias.aliasId }, index)
      .$promise
      .then(operation => this.LogsHelperService.handleOperation(
        serviceName,
        operation.data || operation,
      ))
      .catch(err => this.LogsHelperService.handleError('logs_aliases_attach_index_error', err, { indexName: index.name }));
  }

  detachIndex(serviceName, alias, index) {
    return this.AliasApiService
      .unlinkIndex({ serviceName, aliasId: alias.aliasId, indexId: index.indexId })
      .$promise
      .then(operation => this.LogsHelperService.handleOperation(
        serviceName,
        operation.data || operation,
      ))
      .catch(err => this.LogsHelperService.handleError('logs_aliases_detach_index_error', err, { indexName: index.name }));
  }

  /**
   * creates new alias with default values
   *
   * @returns alias object with default values
   * @memberof LogsAliasesService
   */
  static getNewAlias() {
    return {
      data: {
        description: null,
        suffix: null,
      },
      loading: false,
    };
  }

  getSubscribedOptions(serviceName) {
    return this.LogsOptionsService.getSubscribedOptionsByType(
      serviceName,
      this.LogsConstants.ALIAS_OPTION_REFERENCE,
    );
  }

  getElasticSearchUrl(alias) {
    const url = this.UrlHelper.constructor.findUrl(alias, this.LogsConstants.ELASTICSEARCH_API_URL);
    if (!url) {
      this.CucCloudMessage.error(this.$translate.instant('logs_aliases_get_elasticsearch_url_error', { alias: alias.info.name }));
    }
    return url;
  }

  resetAllCache() {
    this.AccountingAapiService.resetAllCache();
  }
}

angular.module('managerApp').service('LogsAliasesService', LogsAliasesService);
