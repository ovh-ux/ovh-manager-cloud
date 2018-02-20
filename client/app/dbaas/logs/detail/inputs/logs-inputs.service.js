class LogsInputsService {
    constructor ($q, CloudPoll, LogsInputsConstant, OvhApiDbaas, ServiceHelper) {
        this.$q = $q;
        this.AccountingAapiService = OvhApiDbaas.Logs().Accounting().Aapi();
        this.CloudPoll = CloudPoll;
        this.InputsApiLexiService = OvhApiDbaas.Logs().Input().Lexi();
        this.InputsApiAapiService = OvhApiDbaas.Logs().Input().Aapi();
        this.LogsInputsConstant = LogsInputsConstant;
        this.OperationApiService = OvhApiDbaas.Logs().Operation().Lexi();
        this.ServiceHelper = ServiceHelper;
    }

    _transformInput (input) {
        input.info.engine.software = [input.info.engine.name, input.info.engine.version].join(" ");
        input.actions = input.actions.reduce((actions, action) => {
            actions[action.type] = action.isAllowed;
            return actions;
        }, {});
        input.info.state = input.info.status === this.LogsInputsConstant.status.PROCESSING ? this.LogsInputsConstant.state.PROCESSING :
            input.info.isRestartRequired ? this.LogsInputsConstant.state.RESTART_REQUIRED :
                input.info.status === this.LogsInputsConstant.status.INIT && !input.actions.START ? this.LogsInputsConstant.state.TO_CONFIGURE :
                    (input.info.status === this.LogsInputsConstant.status.INIT || input.info.status === this.LogsInputsConstant.status.PENDING) && input.actions.START ? this.LogsInputsConstant.state.PENDING :
                        input.info.status === this.LogsInputsConstant.status.RUNNING ? this.LogsInputsConstant.state.RUNNING : this.LogsInputsConstant.state.UNKNOWN;
        input.info.stateType = this.LogsInputsConstant.stateType[input.info.state];
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
            .$promise.catch(this.ServiceHelper.errorHandler("logs_inputs_get_error"));
    }

    /**
     * gets details of all inputs
     *
     * @param {any} serviceName
     * @returns promise which will be resolve to an array of inputs
     * @memberof LogsInputsService
     */
    getInputDetails (serviceName) {
        return this.getAllInputs(serviceName)
            .then(inputIds => {
                const promises = inputIds.map(inputId => this.getInput(serviceName, inputId));
                return this.$q.all(promises);
            });
    }

    /**
     * gets details of all inputs and transforms them
     *
     * @param {any} serviceName
     * @returns promise which will be resolve to an array of inputs
     * @memberof LogsInputsService
     */
    getInputs (serviceName) {
        return this.getInputDetails(serviceName)
            .then(inputs => {
                inputs.forEach(input => this._transformInput(input));
                return inputs;
            });
    }

    /**
     * delete input
     *
     * @param {any} serviceName
     * @param {any} input, input object to be deleted
     * @returns promise which will resolve with the operation object
     * @memberof LogsInputsService
     */
    deleteInput (serviceName, inputId) {
        return this.InputsApiLexiService.delete({ serviceName, inputId })
            .$promise
            .then(operation => {
                this._resetAllCache();
                return this._handleSuccess(serviceName, operation.data, "logs_inputs_delete_success");
            })
            .catch(this.ServiceHelper.errorHandler("logs_inputs_delete_error"));
    }

    /**
     * start an input
     *
     * @param {any} serviceName
     * @param {any} inputId
     * @returns promise which will resolve with the operation object
     * @memberof LogsInputsService
     */
    startInput (serviceName, inputId) {
        return this.InputsApiLexiService.start({ serviceName, inputId })
            .$promise
            .then(operation => {
                this._resetAllCache();
                this._handleSuccess(serviceName, operation.data, "logs_inputs_start_success");
            })
            .catch(this.ServiceHelper.errorHandler("logs_inputs_start_error"));
    }

    /**
     * restart an input
     *
     * @param {any} serviceName
     * @param {any} inputId
     * @returns promise which will resolve with the operation object
     * @memberof LogsInputsService
     */
    restartInput (serviceName, inputId) {
        return this.InputsApiLexiService.restart({ serviceName, inputId })
            .$promise
            .then(operation => {
                this._resetAllCache();
                this._handleSuccess(serviceName, operation.data, "logs_inputs_restart_success");
            })
            .catch(this.ServiceHelper.errorHandler("logs_inputs_restart_error"));
    }

    /**
     * stop an input
     *
     * @param {any} serviceName
     * @param {any} inputId
     * @returns promise which will resolve with the operation object
     * @memberof LogsInputsService
     */
    stopInput (serviceName, inputId) {
        return this.InputsApiLexiService.end({ serviceName, inputId })
            .$promise
            .then(operation => {
                this._resetAllCache();
                this._handleSuccess(serviceName, operation.data, "logs_inputs_stop_success");
                return operation;
            })
            .catch(this.ServiceHelper.errorHandler("logs_inputs_stop_error"));
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
     * handles success state for create, delete and update inputs.
     * Repetedly polls for operation untill it returns SUCCESS message.
     *
     * @param {any} serviceName
     * @param {any} operation, operation to poll
     * @param {any} successMessage, message to show on UI
     * @returns promise which will be resolved to operation object
     * @memberof LogsInputsService
     */
    _handleSuccess (serviceName, operation, successMessage) {
        this.poller = this._pollOperation(serviceName, operation);
        return this.poller.$promise
            .then(this.ServiceHelper.successHandler(successMessage));
    }

    _killPoller () {
        if (this.poller) {
            this.poller.kill();
        }
    }

    _resetAllCache () {
        this.InputsApiAapiService.resetAllCache();
        this.InputsApiLexiService.resetAllCache();
        this.AccountingAapiService.resetAllCache();
    }

    _pollOperation (serviceName, operation) {
        this._killPoller();
        const pollar = this.CloudPoll.poll({
            item: operation,
            pollFunction: opn => this.OperationApiService.get({ serviceName, operationId: opn.operationId }).$promise,
            stopCondition: opn => opn.state === this.LogsInputsConstant.FAILURE || opn.state === this.LogsInputsConstant.SUCCESS
        });
        return pollar;
    }
}

angular.module("managerApp").service("LogsInputsService", LogsInputsService);
