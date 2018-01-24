class LogsOptionsCtrl {
    constructor ($stateParams, CloudMessage, ControllerHelper, LogsOptionsService, CurrencyService) {
        this.$stateParams = $stateParams;
        this.ControllerHelper = ControllerHelper;
        this.CloudMessage = CloudMessage;
        this.LogsOptionsService = LogsOptionsService;
        this.CurrencyService = CurrencyService;

        this.serviceName = this.$stateParams.serviceName;
        this.messages = {};
        this._initLoaders();
    }

    $onInit () {
        this._loadMessages();
        this.options.load();
        this.currentOptions.load();
    }

    refreshMessage () {
        this.messages = this.messageHandler.getMessages();
    }

    _initLoaders () {
        this.options = this.ControllerHelper.request.getArrayLoader({
            loaderFunction: () => this.LogsOptionsService.getOptions(this.serviceName)
        });
        this.currentOptions = this.ControllerHelper.request.getArrayLoader({
            loaderFunction: () => this.LogsOptionsService.getSubscribedOptions(this.serviceName)
        });
    }

    _loadMessages () {
        const stateName = "dbaas.logs.detail.options";
        this.CloudMessage.unSubscribe(stateName);
        this.messageHandler = this.CloudMessage.subscribe(stateName, {
            onMessage: () => this.refreshMessage()
        });
    }

    getTotalPrice () {
        return this.LogsOptionsService.getTotalPrice(this.options.data);
    }

    getSelectedOptions () {
        return this.LogsOptionsService.getOptionsToOrder(this.options.data);
    }

    getCurrentCurrency () {
        return this.CurrencyService.getCurrentCurrency();
    }

    cancel () {
        history.back();
    }

    order () {
        window.open(this.LogsOptionsService.getOrderURL(this.options.data, this.serviceName));
    }
}

angular.module("managerApp").controller("LogsOptionsCtrl", LogsOptionsCtrl);
