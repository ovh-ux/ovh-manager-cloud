class LogsInputsAddConfigureCtrl {
  constructor($q, $state, $stateParams, $translate, ControllerModalHelper, ControllerHelper,
    LogsInputsService, LogsConstants, CloudMessage) {
    this.$q = $q;
    this.$state = $state;
    this.$stateParams = $stateParams;
    this.$translate = $translate;
    this.serviceName = this.$stateParams.serviceName;
    this.inputId = this.$stateParams.inputId;
    this.ControllerModalHelper = ControllerModalHelper;
    this.ControllerHelper = ControllerHelper;
    this.LogsInputsService = LogsInputsService;
    this.LogsConstants = LogsConstants;
    this.CloudMessage = CloudMessage;
    this.configuration = {
      engineType: '',
      flowgger: {},
      logstash: {},
    };
    this.initLoaders();
  }

  /**
   * initializes the input log url
   *
   * @memberof LogsInputsAddConfigureCtrl
   */
  initLoaders() {
    this.input = this.ControllerHelper.request.getHashLoader({
      loaderFunction: () => this.LogsInputsService.getInput(this.serviceName, this.inputId)
        .then((input) => {
          this.configuration.engineType = input.info.engine.name;
          if (this.configuration.engineType === this.LogsConstants.logstash) {
            this.initLogstash(input.info.engine.configuration);
          } else {
            this.initFlowgger(input.info.engine.configuration);
          }
          return input;
        }),
    });

    this.test = this.ControllerHelper.request.getHashLoader({
      loaderFunction: () => this.LogsInputsService
        .getTestResults(this.serviceName, this.input.data),
    });
    this.previousTest = this.test;

    this.input.load()
      .then(() => this.previousTest.load());
  }

  initFlowgger(configuration) {
    this.configuration.flowgger.kafkaCoalesce = configuration.kafkaCoalesce;
    this.configuration.flowgger.logFormat = configuration.logFormat;
    this.configuration.flowgger.logFraming = configuration.logFraming;
    this.configuration.flowgger.tlsMethod = configuration.tlsMethod;
    this.configuration.flowgger.type = configuration.type;
  }

  static findRowLength(str) {
    const lines = str.split(/\r\n|\r|\n/);
    return lines.length;
  }

  initLogstash(configuration) {
    this.configuration.logstash.inputSection = this.ControllerHelper.constructor
      .htmlDecode(configuration.inputSection);
    this.configuration.logstash.filterSection = this.ControllerHelper.constructor
      .htmlDecode(configuration.filterSection);
    this.configuration.logstash.patternSection = this.ControllerHelper.constructor
      .htmlDecode(configuration.patternSection);
  }

  applyConfiguration(name) {
    this.configuration.logstash.inputSection = this.LogsConstants.logStashWizard[name].input.replace('INPUT_PORT', this.input.data.info.exposedPort);
    this.configuration.logstash.filterSection = this.LogsConstants.logStashWizard[name].filter;
    this.configuration.logstash.patternSection = this.LogsConstants.logStashWizard[name].patterns;
  }

  executeTest() {
    this.CloudMessage.flushChildMessage();
    this.test = this.ControllerHelper.request.getHashLoader({
      loaderFunction: () => (this.logstashForm.$dirty
        ? this.LogsInputsService.updateLogstash(
          this.serviceName,
          this.input.data,
          this.configuration.logstash,
        )
        : this.$q.when({})
      )
        .then(() => this.LogsInputsService.executeTest(this.serviceName, this.input.data))
        .catch(() => this.ControllerHelper.scrollPageToTop()),
    });
    this.test.load();
  }

  saveFlowgger() {
    if (this.flowggerForm.$invalid) {
      return this.$q.reject();
    } if (!this.flowggerForm.$dirty) {
      return this.goToNetworkPage();
    }
    this.CloudMessage.flushChildMessage();
    this.saving = this.ControllerHelper.request.getHashLoader({
      loaderFunction: () => this.LogsInputsService
        .updateFlowgger(this.serviceName, this.input.data, this.configuration.flowgger)
        .then(() => this.goToNetworkPage())
        .finally(() => this.ControllerHelper.scrollPageToTop()),
    });
    return this.saving.load();
  }

  saveLogstash() {
    if (this.logstashForm.$invalid) {
      return this.$q.reject();
    } if (!this.test.data.stdout) {
      return this.ControllerModalHelper.showWarningModal({
        title: this.$translate.instant('logs_inputs_logstash_save_warning_title'),
        message: this.test.data.updatedAt ? this.$translate.instant('logs_inputs_logstash_save_warning_unsuccessful') : this.$translate.instant('logs_inputs_logstash_save_warning_no_test'),
      });
    } if (!this.logstashForm.$dirty) {
      return this.goToNetworkPage();
    }
    this.CloudMessage.flushChildMessage();
    this.saving = this.ControllerHelper.request.getHashLoader({
      loaderFunction: () => this.LogsInputsService
        .updateLogstash(this.serviceName, this.input.data, this.configuration.logstash)
        .then(() => this.goToNetworkPage())
        .finally(() => this.ControllerHelper.scrollPageToTop()),
    });
    return this.saving.load();
  }

  goToNetworkPage() {
    this.$state.go('dbaas.logs.detail.inputs.editwizard.networks', {
      serviceName: this.serviceName,
      inputId: this.inputId,
    });
    return this.$q.resolve();
  }

  getFlowggerLogFormats() {
    return this.LogsInputsService.getFlowggerLogFormats();
  }

  getLogstashLogFormats() {
    return this.LogsInputsService.getLogstashLogFormats();
  }

  getDelimiters() {
    return this.LogsInputsService.getDelimiters();
  }
}

angular.module('managerApp').controller('LogsInputsAddConfigureCtrl', LogsInputsAddConfigureCtrl);
