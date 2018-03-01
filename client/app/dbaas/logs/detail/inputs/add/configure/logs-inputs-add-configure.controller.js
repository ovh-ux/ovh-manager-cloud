class LogsInputsAddConfigureCtrl {
    constructor ($q, $state, $stateParams, ControllerHelper, LogsInputsService, LogsInputsConfigureConstant, CloudMessage) {
        this.$q = $q;
        this.$state = $state;
        this.$stateParams = $stateParams;
        this.serviceName = this.$stateParams.serviceName;
        this.inputId = this.$stateParams.inputId;
        this.ControllerHelper = ControllerHelper;
        this.LogsInputsService = LogsInputsService;
        this.LogsInputsConfigureConstant = LogsInputsConfigureConstant;
        this.CloudMessage = CloudMessage;
        this.configuration = {
            engineType: "",
            flowgger: {},
            logstash: {}
        };
        this._initLoaders();
    }

    /**
     * initializes the input log url
     *
     * @memberof LogsInputsAddConfigureCtrl
     */
    _initLoaders () {
        this.input = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () => this.LogsInputsService.getInput(this.serviceName, this.inputId)
                .then(input => {
                    this.configuration.engineType = input.info.engine.name;
                    if (this.configuration.engineType === this.LogsInputsConfigureConstant.logstash) {
                        this._initLogstash(input.info.engine.configuration);
                    } else {
                        this._initFlowgger(input.info.engine.configuration);
                    }
                    return input;
                })
        });

        this.test = this.previousTest = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () => this.LogsInputsService.getTestResults(this.serviceName, this.input.data)
        });

        this.input.load()
            .then(() => this.previousTest.load());
    }

    _initFlowgger (configuration) {
        this.configuration.flowgger.kafkaCoalesce = configuration.kafkaCoalesce;
        this.configuration.flowgger.logFormat = configuration.logFormat;
        this.configuration.flowgger.logFraming = configuration.logFraming;
        this.configuration.flowgger.tlsMethod = configuration.tlsMethod;
        this.configuration.flowgger.type = configuration.type;
    }

    findRowLength (str) {
        const lines = str.split(/\r\n|\r|\n/);
        return lines.length;
    }

    _initLogstash (configuration) {
        this.configuration.logstash.inputSection = configuration.inputSection;
        this.configuration.logstash.filterSection = configuration.filterSection;
        this.configuration.logstash.patternSection = configuration.patternSection;
    }

    applyConfiguration (name) {
        this.configuration.logstash.inputSection = this.LogsInputsConfigureConstant.logStashWizard[name].input.replace("INPUT_PORT", this.input.data.info.exposedPort);
        this.configuration.logstash.filterSection = this.LogsInputsConfigureConstant.logStashWizard[name].filter;
        this.configuration.logstash.patternSection = this.LogsInputsConfigureConstant.logStashWizard[name].patterns;
    }

    executeTest () {
        this.CloudMessage.flushChildMessage();
        this.test = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () => (this.logstashForm.$dirty ? this.LogsInputsService.updateLogstash(this.serviceName, this.input.data, this.configuration.logstash) : this.$q.when({}))
                .then(() => this.LogsInputsService.executeTest(this.serviceName, this.input.data))
                .catch(() => this.ControllerHelper.scrollPageToTop())
        });
        this.test.load();
    }

    saveFlowgger () {
        if (this.flowggerForm.$invalid) {
            return this.$q.reject();
        } else if (!this.flowggerForm.$dirty) {
            return this.goToNetworkPage();
        }
        this.CloudMessage.flushChildMessage();
        this.saving = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () => this.LogsInputsService.updateFlowgger(this.serviceName, this.input.data, this.configuration.flowgger)
                .then(() => this.goToNetworkPage())
                .finally(() => this.ControllerHelper.scrollPageToTop())
        });
        return this.saving.load();
    }

    saveLogstash () {
        if (this.logstashForm.$invalid) {
            return this.$q.reject();
        } else if (!this.logstashForm.$dirty) {
            return this.goToNetworkPage();
        }
        this.CloudMessage.flushChildMessage();
        this.saving = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () => this.LogsInputsService.updateLogstash(this.serviceName, this.input.data, this.configuration.logstash)
                .then(() => this.goToNetworkPage())
                .finally(() => this.ControllerHelper.scrollPageToTop())
        });
        return this.saving.load();
    }

    goToNetworkPage () {
        this.$state.go("dbaas.logs.detail.inputs.editwizard.networks", {
            serviceName: this.serviceName,
            inputId: this.inputId
        });
        return this.$q.resolve();
    }
}

angular.module("managerApp").controller("LogsInputsAddConfigureCtrl", LogsInputsAddConfigureCtrl);
