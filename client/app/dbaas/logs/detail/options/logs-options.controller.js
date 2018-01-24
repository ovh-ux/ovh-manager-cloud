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

    /**
     * refreshes the messages
     *
     * @memberof LogsOptionsCtrl
     */
    refreshMessage () {
        this.messages = this.messageHandler.getMessages();
    }

    /**
     * initializes the options and currentOptions loaders
     *
     * @memberof LogsOptionsCtrl
     */
    _initLoaders () {
        this.options = this.ControllerHelper.request.getArrayLoader({
            loaderFunction: () => this.LogsOptionsService.getOptions(this.serviceName)
        });
        this.currentOptions = this.ControllerHelper.request.getArrayLoader({
            loaderFunction: () => this.LogsOptionsService.getSubscribedOptions(this.serviceName)
        });
    }

    /**
     * loads the messages for the current state
     *
     * @memberof LogsOptionsCtrl
     */
    _loadMessages () {
        const stateName = "dbaas.logs.detail.options";
        this.CloudMessage.unSubscribe(stateName);
        this.messageHandler = this.CloudMessage.subscribe(stateName, {
            onMessage: () => this.refreshMessage()
        });
    }

    /**
     * returns the total price for all the selected options
     *
     * @returns the total price
     * @memberof LogsOptionsCtrl
     */
    getTotalPrice () {
        return this.LogsOptionsService.getTotalPrice(this.options.data);
    }

    /**
     * returns the list of selected options
     *
     * @returns the list of options selected for order
     * @memberof LogsOptionsCtrl
     */
    getSelectedOptions () {
        return this.LogsOptionsService.getOptionsToOrder(this.options.data);
    }

    /**
     * returns the current currency symbol being used
     *
     * @returns the symbol for the current currency
     * @memberof LogsOptionsCtrl
     */
    getCurrentCurrency () {
        return this.CurrencyService.getCurrentCurrency();
    }

    /**
     * takes the browser to the previously visited page
     *
     * @memberof LogsOptionsCtrl
     */
    cancel () {
        history.back();
    }

    /**
     * opens the order page in a new window for the selected options
     *
     * @memberof LogsOptionsCtrl
     */
    order () {
        window.open(this.LogsOptionsService.getOrderURL(this.options.data, this.serviceName));
    }
}

angular.module("managerApp").controller("LogsOptionsCtrl", LogsOptionsCtrl);
