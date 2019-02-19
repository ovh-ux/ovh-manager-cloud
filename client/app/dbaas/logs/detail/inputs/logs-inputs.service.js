class LogsInputsService {
  constructor(
    $q,
    CucCloudMessage,
    CucCloudPoll,
    LogsHelperService,
    LogsConstants,
    LogsOptionsService,
    OvhApiDbaas,
    ServiceHelper,
  ) {
    this.$q = $q;
    this.AccountingAapiService = OvhApiDbaas.Logs().Accounting().Aapi();
    this.DetailsAapiService = OvhApiDbaas.Logs().Details().Aapi();
    this.CucCloudMessage = CucCloudMessage;
    this.CucCloudPoll = CucCloudPoll;
    this.InputsApiAapiService = OvhApiDbaas.Logs().Input().Aapi();
    this.InputsApiLexiService = OvhApiDbaas.Logs().Input().v6();
    this.LogsConstants = LogsConstants;
    this.LogsOptionsService = LogsOptionsService;
    this.OperationApiService = OvhApiDbaas.Logs().Operation().v6();
    this.ServiceHelper = ServiceHelper;
    this.LogsHelperService = LogsHelperService;

    this.initializeData();
  }

  initializeData() {
    this.flowggerLogFormats = [
      {
        value: 'GELF',
        name: 'inputs_logs_configure_format_gelf',
      },
      {
        value: 'RFC5424',
        name: 'inputs_logs_configure_format_rfc',
      },
      {
        value: 'LTSV',
        name: 'inputs_logs_configure_format_ltsv',
      },
      {
        value: 'CAPNP',
        name: 'inputs_logs_configure_format_cap_proto',
      },
    ];

    this.delimiters = [
      {
        value: 'LINE',
        name: 'inputs_logs_configure_delimiter_line',
      },
      {
        value: 'NUL',
        name: 'inputs_logs_configure_delimiter_nul',
      },
      {
        value: 'SYSLEN',
        name: 'inputs_logs_configure_delimiter_syslen',
      },
      {
        value: 'CAPNP',
        name: 'inputs_logs_configure_format_cap_proto',
      },
    ];

    this.logstashLogFormats = [
      {
        value: 'Syslog',
        name: 'inputs_logs_configure_format_syslog',
      },
      {
        value: 'Apache',
        name: 'inputs_logs_configure_format_apache',
      },
      {
        value: 'HAProxy',
        name: 'inputs_logs_configure_format_ha_proxy',
      },
      {
        value: 'MySQL Slow Queries',
        name: 'inputs_logs_configure_format_my_sql',
      },
      {
        value: 'Twitter',
        name: 'inputs_logs_configure_format_twitter',
      },
      {
        value: 'Nginx',
        name: 'inputs_logs_configure_format_nginx',
      },
    ];
  }

  getFlowggerLogFormats() {
    return this.flowggerLogFormats;
  }

  getLogstashLogFormats() {
    return this.logstashLogFormats;
  }

  getDelimiters() {
    return this.delimiters;
  }

  /**
   * add input
   *
   * @param {any} serviceName
   * @param {any} input, input object to be added
   * @returns promise which will resolve with the operation object
   * @memberof LogsInputsService
   */
  addInput(serviceName, input) {
    return this.InputsApiLexiService
      .create({ serviceName }, this.constructor.transformInputToSave(input))
      .$promise
      .then((operation) => {
        this.resetAllCache();
        return this.LogsHelperService.handleOperation(serviceName, operation.data);
      })
      .catch(err => this.LogsHelperService.handleError('logs_inputs_add_error', err, { inputTitle: input.info.title }));
  }

  /**
   * delete input
   *
   * @param {any} serviceName
   * @param {any} input, input object to be deleted
   * @returns promise which will resolve with the operation object
   * @memberof LogsInputsService
   */
  deleteInput(serviceName, input) {
    return this.InputsApiLexiService.delete({ serviceName, inputId: input.info.inputId })
      .$promise
      .then((operation) => {
        this.resetAllCache();
        return this.LogsHelperService.handleOperation(serviceName, operation.data || operation, 'logs_inputs_delete_success', { inputTitle: input.info.title });
      })
      .catch(err => this.LogsHelperService.handleError('logs_inputs_delete_error', err, { inputTitle: input.info.title }));
  }

  /**
   * returns array of Input IDs of logged in user
   *
   * @param {any} serviceName
   * @returns promise which will be resolve to array of input IDs
   * @memberof LogsInputsService
   */
  getDetails(serviceName) {
    return this.DetailsAapiService.me({ serviceName })
      .$promise.then(details => this.constructor.transformDetails(details))
      .catch(err => this.LogsHelperService.handleError('logs_inputs_details_get_error', err, {}));
  }

  /**
   * returns array of Input IDs of logged in user
   *
   * @param {any} serviceName
   * @returns promise which will be resolve to array of input IDs
   * @memberof LogsInputsService
   */
  getAllInputs(serviceName) {
    return this.InputsApiLexiService.query({ serviceName }).$promise;
  }

  /**
   * returns details of an input
   *
   * @param {any} serviceName
   * @param {any} inputId
   * @returns promise which will be resolve to an input object
   * @memberof LogsInputsService
   */
  getInput(serviceName, inputId) {
    return this.InputsApiAapiService.get({ serviceName, inputId })
      .$promise.catch(err => this.LogsHelperService.handleError('logs_inputs_get_error', err, {}));
  }

  /**
   * returns details of an input and transforms it
   *
   * @param {any} serviceName
   * @param {any} inputId
   * @returns promise which will be resolve to an input object
   * @memberof LogsInputsService
   */
  getInputDetail(serviceName, inputId) {
    return this.getInput(serviceName, inputId)
      .then(input => this.transformInput(input));
  }

  /**
   * gets a temporary url to retrive the input logs
   *
   * @param {any} serviceName
   * @param {any} inputId
   * @returns promise which will resolve with the temporary url
   * @memberof LogsInputsService
   */
  getInputLogUrl(serviceName, inputId) {
    return this.InputsApiLexiService.logurl({ serviceName, inputId })
      .$promise.catch(err => this.LogsHelperService.handleError('logs_inputs_logurl_error', err, {}));
  }

  /**
   * gets details of all inputs
   *
   * @param {any} serviceName
   * @returns promise which will be resolve to an array of inputs
   * @memberof LogsInputsService
   */
  getInputs(serviceName) {
    return this.getAllInputs(serviceName)
      .then((inputIds) => {
        const promises = inputIds.map(inputId => this.getInputDetail(serviceName, inputId));
        return this.$q.all(promises);
      });
  }

  getMainOffer(serviceName) {
    return this.AccountingAapiService.me({ serviceName }).$promise
      .then(me => ({
        max: me.offer.maxNbInput,
        current: me.offer.curNbInput,
      })).catch(err => this.LogsHelperService.handleError('logs_inputs_main_offer_get_error', err, {}));
  }

  getNewInput() {
    return {
      data: {
        info: {
          exposedPort: this.LogsConstants.INPUT_DEFAULT_PORT,
        },
      },
      loading: false,
    };
  }

  /**
   * returns the object containing total number of inputs and total number of inputs used
   *
   * @param {any} serviceName
   * @returns quota object containing total number inputs and configured number of inputs
   * @memberof LogsInputsService
   */
  getQuota(serviceName) {
    return this.AccountingAapiService.me({ serviceName }).$promise
      .then((me) => {
        const quota = {
          max: me.total.maxNbInput,
          configured: me.total.curNbInput,
          currentUsage: me.total.curNbInput * 100 / me.total.maxNbInput,
        };
        return quota;
      }).catch(err => this.LogsHelperService.handleError('logs_inputs_quota_get_error', err, {}));
  }

  /**
   * returns the subscribed options
   *
   * @param {any} serviceName
   * @returns array of options
   * @memberof LogsInputsService
   */
  getSubscribedOptions(serviceName) {
    return this.LogsOptionsService.getSubscribedOptionsByType(
      serviceName,
      this.LogsConstants.INPUT_OPTION_REFERENCE,
    );
  }

  /**
   * restart an input
   *
   * @param {any} serviceName
   * @param {any} inputId
   * @returns promise which will resolve with the operation object
   * @memberof LogsInputsService
   */
  restartInput(serviceName, input) {
    return this.InputsApiLexiService.restart({ serviceName, inputId: input.info.inputId })
      .$promise
      .then((operation) => {
        this.resetAllCache();
        return this.LogsHelperService.handleOperation(serviceName, operation.data || operation, 'logs_inputs_restart_success', { inputTitle: input.info.title });
      })
      .catch((err) => {
        this.resetAllCache();
        return this.LogsHelperService.handleError('logs_inputs_restart_error', err, { inputTitle: input.info.title });
      });
  }

  /**
   * start an input
   *
   * @param {any} serviceName
   * @param {any} inputId
   * @returns promise which will resolve with the operation object
   * @memberof LogsInputsService
   */
  startInput(serviceName, input) {
    return this.InputsApiLexiService.start({ serviceName, inputId: input.info.inputId })
      .$promise
      .then((operation) => {
        this.resetAllCache();
        return this.LogsHelperService.handleOperation(serviceName, operation.data || operation, 'logs_inputs_start_success', { inputTitle: input.info.title });
      })
      .catch((err) => {
        this.resetAllCache();
        return this.LogsHelperService.handleError('logs_inputs_start_error', err, { inputTitle: input.info.title });
      });
  }

  /**
   * stop an input
   *
   * @param {any} serviceName
   * @param {any} inputId
   * @returns promise which will resolve with the operation object
   * @memberof LogsInputsService
   */
  stopInput(serviceName, input) {
    return this.InputsApiLexiService.end({ serviceName, inputId: input.info.inputId })
      .$promise
      .then((operation) => {
        this.resetAllCache();
        return this.LogsHelperService.handleOperation(serviceName, operation.data || operation, 'logs_inputs_stop_success', { inputTitle: input.info.title });
      })
      .catch((err) => {
        this.resetAllCache();
        return this.LogsHelperService.handleError('logs_inputs_stop_error', err, { inputTitle: input.info.title });
      });
  }

  /**
   * transforms the input by adding some additional information
   *
   * @param {any} input
   * @returns the transformed input
   * @memberof LogsInputsService
   */
  transformInput(input) {
    _.set(input, 'info.engine.software', [input.info.engine.name, input.info.engine.version].join(' '));
    _.set(input, 'info.exposedPort', parseInt(input.info.exposedPort, 10));
    _.set(input, 'actionsMap', input.actions.reduce((actions, action) => {
      actions[action.type] = action.isAllowed; // eslint-disable-line
      return actions;
    }, {}));

    const isProcessing = input.info.status === this.LogsConstants.inputStatus.PROCESSING;
    const isToBeConfigured = input.info.status === this.LogsConstants.inputStatus.INIT
      && !input.actionsMap.START;
    const isPending = (input.info.status === this.LogsConstants.inputStatus.INIT
      || input.info.status === this.LogsConstants.inputStatus.PENDING)
      && input.actionsMap.START;
    const isRunning = input.info.status === this.LogsConstants.inputStatus.RUNNING;

    /* eslint-disable no-nested-ternary */
    _.set(input, 'info.state', isProcessing ? this.LogsConstants.inputState.PROCESSING
      : input.info.isRestartRequired ? this.LogsConstants.inputState.RESTART_REQUIRED
        : isToBeConfigured ? this.LogsConstants.inputState.TO_CONFIGURE
          : isPending ? this.LogsConstants.inputState.PENDING
            : isRunning ? this.LogsConstants.inputState.RUNNING
              : this.LogsConstants.inputState.UNKNOWN);
    /* eslint-disable no-nested-ternary */
    _.set(input, 'info.stateType', this.LogsConstants.inputStateType[input.info.state]);
    return input;
  }

  addNetwork(serviceName, input, network) {
    return this.InputsApiLexiService
      .trustNetwork({ serviceName, inputId: input.info.inputId }, network)
      .$promise
      .then((operation) => {
        this.InputsApiAapiService.resetAllCache();
        return this.LogsHelperService.handleOperation(serviceName, operation.data || operation);
      })
      .catch(err => this.LogsHelperService.handleError('logs_inputs_network_add_error', err, { network: network.network, inputTitle: input.info.title }));
  }

  executeTest(serviceName, input) {
    return this.InputsApiLexiService.test({ serviceName, inputId: input.info.inputId })
      .$promise
      .then(operation => this.LogsHelperService.handleOperation(serviceName, operation))
      .then(() => this.getTestResults(serviceName, input))
      .catch(err => this.LogsHelperService.handleError('logs_inputs_test_error', err, { inputTitle: input.info.title }));
  }

  removeNetwork(serviceName, input, network) {
    return this.InputsApiLexiService
      .rejectNetwork({
        serviceName,
        inputId: input.info.inputId,
        allowedNetworkId: network.allowedNetworkId,
      })
      .$promise
      .then((operation) => {
        this.InputsApiAapiService.resetAllCache();
        return this.LogsHelperService.handleOperation(serviceName, operation.data || operation);
      })
      .catch(err => this.LogsHelperService.handleError('logs_inputs_network_remove_error', err, { network: network.network, inputTitle: input.info.title }));
  }

  updateFlowgger(serviceName, input, flowgger) {
    return this.InputsApiLexiService
      .updateFlowgger({ serviceName, inputId: input.info.inputId }, flowgger)
      .$promise
      .then((operation) => {
        this.InputsApiAapiService.resetAllCache();
        return this.LogsHelperService.handleOperation(serviceName, operation.data || operation);
      })
      .catch(err => this.LogsHelperService.handleError('logs_inputs_flowgger_update_error', err, { inputTitle: input.info.title }));
  }

  updateLogstash(serviceName, input, logstash) {
    return this.InputsApiLexiService
      .updateLogstash({ serviceName, inputId: input.info.inputId }, logstash)
      .$promise
      .then((operation) => {
        this.InputsApiAapiService.resetAllCache();
        return this.LogsHelperService.handleOperation(serviceName, operation.data || operation);
      })
      .catch(err => this.LogsHelperService.handleError('logs_inputs_logstash_update_error', err, { inputTitle: input.info.title }));
  }

  /**
   * update input
   *
   * @param {any} serviceName
   * @param {any} input, input object to be updated
   * @returns promise which will resolve with the operation object
   * @memberof LogsInputsService
   */
  updateInput(serviceName, input) {
    return this.InputsApiLexiService
      .update({
        serviceName,
        inputId: input.info.inputId,
      }, this.constructor.transformInputToSave(input))
      .$promise
      .then((operation) => {
        this.resetAllCache();
        return this.LogsHelperService.handleOperation(serviceName, operation.data || operation);
      })
      .catch(err => this.LogsHelperService.handleError('logs_inputs_update_error', err, { inputTitle: input.info.title }));
  }

  getTestResults(serviceName, input) {
    return this.InputsApiLexiService.testResult({
      serviceName,
      inputId: input.info.inputId,
    }).$promise;
  }

  /**
   * Resets the cache of all APIs used
   *
   * @memberof LogsInputsService
   */
  resetAllCache() {
    this.InputsApiAapiService.resetAllCache();
    this.InputsApiLexiService.resetAllCache();
    this.AccountingAapiService.resetAllCache();
  }

  static transformDetails(details) {
    details.engines.forEach((engine) => {
      if (!engine.isDeprecated) {
        _.set(engine, 'name', engine.name.charAt(0).toUpperCase() + engine.name.toLowerCase().slice(1));
      }
    });
    return details;
  }

  static transformInputToSave(input) {
    return {
      title: input.info.title,
      description: input.info.description,
      engineId: input.info.engineId,
      optionId: input.info.optionId ? input.info.optionId : undefined,
      streamId: input.info.streamId,
      singleInstanceEnabled: input.info.singleInstanceEnabled,
      exposedPort: input.info.exposedPort.toString(),
    };
  }
}

angular.module('managerApp').service('LogsInputsService', LogsInputsService);
