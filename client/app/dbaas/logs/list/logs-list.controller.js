class LogsListCtrl {
    constructor ($state, CloudMessage, LogsListService, ControllerHelper, LogsConstants, LogsHelperService) {
        this.$state = $state;
        this.CloudMessage = CloudMessage;
        this.LogsListService = LogsListService;
        this.ControllerHelper = ControllerHelper;
        this.LogsConstants = LogsConstants;
        this.LogsHelperService = LogsHelperService;
        this.messages = [];

        this.initLoaders();
    }

    $onInit () {
        this.CloudMessage.unSubscribe("dbaas.logs.list");
        this.messageHandler = this.CloudMessage.subscribe("dbaas.logs.list", { onMessage: () => this.refreshMessage() });
    }

    refreshMessage () {
        this.messages = this.messageHandler.getMessages();
    }

    goToOptionsPage (service) {
        if (service.isBasicOffer) {
            this.LogsHelperService.showOfferUpgradeModal(service.serviceName);
        } else {
            this.$state.go("dbaas.logs.detail.options", {
                serviceName: service.serviceName
            });
        }
    }

    goToOfferPage (service) {
        this.$state.go("dbaas.logs.detail.offer", {
            serviceName: service.serviceName
        });
    }

    initLoaders () {
        this.accounts = this.ControllerHelper.request.getArrayLoader({
            loaderFunction: () => this.LogsListService.getServices()
        });
        this.accounts.load();
    }
}

angular.module("managerApp").controller("LogsListCtrl", LogsListCtrl);
