class LogsOptionsCtrl {
    constructor ($stateParams, $window, ControllerHelper, LogsOptionsService, CurrencyService) {
        this.$stateParams = $stateParams;
        this.$window = $window;
        this.ControllerHelper = ControllerHelper;
        this.LogsOptionsService = LogsOptionsService;
        this.CurrencyService = CurrencyService;

        this.serviceName = this.$stateParams.serviceName;
        this.messages = {};
        this._initLoaders();
    }

    $onInit () {
        this.options.load();
        this.currentOptions.load();
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
     * returns the total price for all the selected options
     *
     * @returns the total price
     * @memberof LogsOptionsCtrl
     */
    getTotalPrice () {
        return _.reduce(this.options.data, (total, option) => total + option.quantity * option.price, 0).toFixed(2);
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
        this.$window.history.back();
    }

    /**
     * opens the order page in a new window for the selected options
     *
     * @memberof LogsOptionsCtrl
     */
    order () {
        this.$window.open(this.LogsOptionsService.getOrderURL(this.options.data, this.serviceName));
    }
}

angular.module("managerApp").controller("LogsOptionsCtrl", LogsOptionsCtrl);
