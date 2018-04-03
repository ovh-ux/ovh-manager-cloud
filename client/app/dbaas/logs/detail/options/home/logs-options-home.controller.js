class LogsOptionsCtrl {
    constructor ($state, $stateParams, $window, ControllerHelper, LogsOfferConstant, LogsOfferService, LogsOptionsService, CurrencyService, OrderHelperService) {
        this.$state = $state;
        this.$stateParams = $stateParams;
        this.$window = $window;
        this.ControllerHelper = ControllerHelper;
        this.LogsOfferConstant = LogsOfferConstant;
        this.LogsOptionsService = LogsOptionsService;
        this.CurrencyService = CurrencyService;
        this.OrderHelperService = OrderHelperService;

        this.serviceName = this.$stateParams.serviceName;
        this.messages = {};
        this._initLoaders();
    }

    $onInit () {
        this.options.load();
        this.currentOptions.load();
        this.selectedOffer.load();
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
            loaderFunction: () => this.LogsOptionsService.getSubscribedOptionsMapGrouped(this.serviceName)
        });
        this.selectedOffer = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () => this.LogsOptionsService.getOffer(this.serviceName)
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
     * Checks if the user has a basic offer
     *
     * @returns true if the user is subscribed to a basic offer
     * @memberof LogsOptionsCtrl
     */
    isBasicOffer () {
        return this.selectedOffer.data.reference === this.LogsOfferConstant.basicOffer;
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
     * opens the order page for the selected options
     *
     * @memberof LogsOptionsCtrl
     */
    order () {
        this.OrderHelperService.openExpressOrderUrl(
            this.LogsOptionsService.getOrderConfiguration(this.options.data, this.serviceName)
        );
    }

    goToManage () {
        this.$state.go("dbaas.logs.detail.options.manage", {
            serviceName: this.serviceName
        });
    }
}

angular.module("managerApp").controller("LogsOptionsCtrl", LogsOptionsCtrl);
