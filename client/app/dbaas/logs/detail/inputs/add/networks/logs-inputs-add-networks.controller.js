class LogsInputsAddNetworksCtrl {
  constructor($q, $stateParams, ControllerHelper, LogsInputsService, CloudMessage) {
    this.$q = $q;
    this.$stateParams = $stateParams;
    this.serviceName = this.$stateParams.serviceName;
    this.inputId = this.$stateParams.inputId;
    this.ControllerHelper = ControllerHelper;
    this.LogsInputsService = LogsInputsService;
    this.CloudMessage = CloudMessage;
    this.editMode = Boolean(this.inputId);

    this.initLoaders();
  }

  initLoaders() {
    this.input = this.ControllerHelper.request.getHashLoader({
      loaderFunction: () => this.LogsInputsService.getInput(this.serviceName, this.inputId)
        .then((input) => {
          input.allowedNetworks.push({
            network: null,
          });
          return input;
        }),
    });
    this.input.load();
  }

  addNetwork(network) {
    if (this.form.$invalid) {
      return this.$q.reject();
    }
    this.CloudMessage.flushChildMessage();
    this.saving = this.ControllerHelper.request.getHashLoader({
      loaderFunction: () => this.LogsInputsService
        .addNetwork(this.serviceName, this.input.data, network)
        .then(() => this.input.load())
        .catch(() => this.ControllerHelper.scrollPageToTop()),
    });
    return this.saving.load();
  }

  removeNetwork(network) {
    this.CloudMessage.flushChildMessage();
    this.saving = this.ControllerHelper.request.getHashLoader({
      loaderFunction: () => this.LogsInputsService
        .removeNetwork(this.serviceName, this.input.data, network)
        .then(() => this.input.load())
        .catch(() => this.ControllerHelper.scrollPageToTop()),
    });
    return this.saving.load();
  }
}

angular.module('managerApp').controller('LogsInputsAddNetworksCtrl', LogsInputsAddNetworksCtrl);
