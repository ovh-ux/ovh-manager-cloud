class LogsListCtrl {
  constructor($state, CucCloudMessage, LogsListService, ControllerHelper, LogsConstants,
    LogsHelperService, OrderHelperService) {
    this.$state = $state;
    this.CucCloudMessage = CucCloudMessage;
    this.LogsListService = LogsListService;
    this.ControllerHelper = ControllerHelper;
    this.LogsConstants = LogsConstants;
    this.LogsHelperService = LogsHelperService;
    this.OrderHelperService = OrderHelperService;
    this.messages = [];

    this.initLoaders();
  }

  $onInit() {
    this.CucCloudMessage.unSubscribe('dbaas.logs.list');
    this.messageHandler = this.CucCloudMessage.subscribe('dbaas.logs.list', { onMessage: () => this.refreshMessage() });
    this.OrderHelperService.buildUrl(this.LogsConstants.ORDER_URL)
      .then((url) => {
        this.orderURL = url;
      });
  }

  refreshMessage() {
    this.messages = this.messageHandler.getMessages();
  }

  goToOptionsPage(service) {
    if (service.isBasicOffer) {
      this.LogsHelperService.showOfferUpgradeModal(service.serviceName);
    } else {
      this.$state.go('dbaas.logs.detail.options', {
        serviceName: service.serviceName,
      });
    }
  }

  goToOfferPage(service) {
    this.$state.go('dbaas.logs.detail.offer', {
      serviceName: service.serviceName,
    });
  }

  initLoaders() {
    this.accounts = this.ControllerHelper.request.getArrayLoader({
      loaderFunction: () => this.LogsListService.getServices(),
    });
    this.accounts.load();
  }
}

angular.module('managerApp').controller('LogsListCtrl', LogsListCtrl);
