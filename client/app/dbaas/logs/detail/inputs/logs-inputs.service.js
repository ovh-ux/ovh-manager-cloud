class LogsInputsService {
    constructor ($q, CloudMessage, CloudPoll, LogsInputsConstant, OvhApiDbaas, ServiceHelper) {
        this.$q = $q;
        this.AccountingAapiService = OvhApiDbaas.Logs().Accounting().Aapi();
        this.CloudMessage = CloudMessage;
        this.CloudPoll = CloudPoll;
        this.InputsApiAapiService = OvhApiDbaas.Logs().Input().Aapi();
        this.InputsApiLexiService = OvhApiDbaas.Logs().Input().Lexi();
        this.LogsInputsConstant = LogsInputsConstant;
        this.OperationApiService = OvhApiDbaas.Logs().Operation().Lexi();
        this.ServiceHelper = ServiceHelper;
    }

    /**
     * delete input
     *
     * @param {any} serviceName
     * @param {any} input, input object to be deleted
     * @returns promise which will resolve with the operation object
     * @memberof LogsInputsService
     */
    deleteInput (serviceName, input) {
        return this.InputsApiLexiService.delete({ serviceName, inputId: input.info.inputId })
            .$promise
            .then(operation => {
                this._resetAllCache();
                return this._handleSuccess(serviceName, operation.data, "logs_inputs_delete_success", { inputTitle: input.info.title });
            })
            .catch(err => this._handleError("logs_inputs_delete_error", err, { inputTitle: input.info.title }));
    }

    /**
     * returns array of Input IDs of logged in user
     *
     * @param {any} serviceName
     * @returns promise which will be resolve to array of input IDs
     * @memberof LogsInputsService
     */
    getAllInputs (serviceName) {
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
    getInput (serviceName, inputId) {
        return this.InputsApiAapiService.get({ serviceName, inputId })
            .$promise.catch(err => this._handleError("logs_inputs_get_error", err, { inputId }));
    }

    /**
     * returns details of an input and transforms it
     *
     * @param {any} serviceName
     * @param {any} inputId
     * @returns promise which will be resolve to an input object
     * @memberof LogsInputsService
     */
    getInputDetail (serviceName, inputId) {
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
    getInputLogUrl (serviceName, inputId) {
        return this.InputsApiLexiService.logurl({ serviceName, inputId })
            .$promise.catch(this.ServiceHelper.errorHandler("logs_inputs_logurl_error"));
    }

    /**
     * gets details of all inputs
     *
     * @param {any} serviceName
     * @returns promise which will be resolve to an array of inputs
     * @memberof LogsInputsService
     */
    getInputs (serviceName) {
        return this.getAllInputs(serviceName)
            .then(inputIds => {
                const promises = inputIds.map(inputId => this.getInputDetail(serviceName, inputId));
                return this.$q.all(promises);
            });
    }

    /**
     * returns the object containing total number of inputs and total number of inputs used
     *
     * @param {any} serviceName
     * @returns quota object containing total number inputs and configured number of inputs
     * @memberof LogsInputsService
     */
    getQuota (serviceName) {
        return this.AccountingAapiService.me({ serviceName }).$promise
            .then(me => {
                const quota = {
                    max: me.total.maxNbInput,
                    configured: me.total.curNbInput,
                    currentUsage: me.total.curNbInput * 100 / me.total.maxNbInput
                };
                return quota;
            }).catch(this.ServiceHelper.errorHandler("logs_inputs_quota_get_error"));
    }

    /**
     * restart an input
     *
     * @param {any} serviceName
     * @param {any} inputId
     * @returns promise which will resolve with the operation object
     * @memberof LogsInputsService
     */
    restartInput (serviceName, input) {
        return this.InputsApiLexiService.restart({ serviceName, inputId: input.info.inputId })
            .$promise
            .then(operation => {
                this._resetAllCache();
                return this._handleSuccess(serviceName, operation.data, "logs_inputs_restart_success", { inputTitle: input.info.title });
            })
            .catch(err => {
                this._resetAllCache();
                return this._handleError("logs_inputs_restart_error", err, { inputTitle: input.info.title });
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
    startInput (serviceName, input) {
        return this.InputsApiLexiService.start({ serviceName, inputId: input.info.inputId })
            .$promise
            .then(operation => {
                this._resetAllCache();
                return this._handleSuccess(serviceName, operation.data, "logs_inputs_start_success", { inputTitle: input.info.title });
            })
            .catch(err => {
                this._resetAllCache();
                return this._handleError("logs_inputs_start_error", err, { inputTitle: input.info.title });
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
    stopInput (serviceName, input) {
        return this.InputsApiLexiService.end({ serviceName, inputId: input.info.inputId })
            .$promise
            .then(operation => {
                this._resetAllCache();
                return this._handleSuccess(serviceName, operation.data, "logs_inputs_stop_success", { inputTitle: input.info.title });
            })
            .catch(err => {
                this._resetAllCache();
                return this._handleError("logs_inputs_stop_error", err, { inputTitle: input.info.title });
            });
    }

    /**
     * transforms the input by adding some additional information
     *
     * @param {any} input
     * @returns the transformed input
     * @memberof LogsInputsService
     */
    transformInput (input) {
        input.info.engine.software = [input.info.engine.name, input.info.engine.version].join(" ");
        input.actionsMap = input.actions.reduce((actions, action) => {
            actions[action.type] = action.isAllowed;
            return actions;
        }, {});
        input.info.state = input.info.status === this.LogsInputsConstant.status.PROCESSING ? this.LogsInputsConstant.state.PROCESSING :
            input.info.isRestartRequired ? this.LogsInputsConstant.state.RESTART_REQUIRED :
                input.info.status === this.LogsInputsConstant.status.INIT && !input.actionsMap.START ? this.LogsInputsConstant.state.TO_CONFIGURE :
                    (input.info.status === this.LogsInputsConstant.status.INIT || input.info.status === this.LogsInputsConstant.status.PENDING) && input.actionsMap.START ? this.LogsInputsConstant.state.PENDING :
                        input.info.status === this.LogsInputsConstant.status.RUNNING ? this.LogsInputsConstant.state.RUNNING : this.LogsInputsConstant.state.UNKNOWN;
        input.info.stateType = this.LogsInputsConstant.stateType[input.info.state];
        return input;
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
            .$promise.then(() => this.ServiceHelper.successHandler(successMessage)(messageData));
    }

    /**
     * Resets the cache of all APIs used
     *
     * @memberof LogsInputsService
     */
    _resetAllCache () {
        this.InputsApiAapiService.resetAllCache();
        this.InputsApiLexiService.resetAllCache();
        this.AccountingAapiService.resetAllCache();
    }

    /**
     * Stops the previous pollers and creates a new one
     *
     * @returns the new poller
     * @memberof LogsInputsService
     */
    _pollOperation (serviceName, operation) {
        const pollar = this.CloudPoll.poll({
            item: operation,
            pollFunction: opn => this.OperationApiService.get({ serviceName, operationId: opn.operationId }).$promise,
            stopCondition: opn => opn.state === this.LogsInputsConstant.FAILURE || opn.state === this.LogsInputsConstant.SUCCESS
        });
        return pollar;
    }
}

angular.module("managerApp").service("LogsInputsService", LogsInputsService);
