class LogsOptionsCtrl {
    constructor ($state, $stateParams, $window, ControllerHelper, LogsConstants, LogsOfferService, LogsOptionsService, CurrencyService, OrderHelperService, LogsDetailService) {
        this.$state = $state;
        this.$stateParams = $stateParams;
        this.$window = $window;
        this.ControllerHelper = ControllerHelper;
        this.LogsOptionsService = LogsOptionsService;
        this.CurrencyService = CurrencyService;
        this.OrderHelperService = OrderHelperService;
        this.LogsDetailService = LogsDetailService;
        this.LogsConstants = LogsConstants;

        this.serviceName = this.$stateParams.serviceName;
        this.messages = {};
        this._initLoaders();
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

        this.service = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () => this.LogsDetailService.getServiceDetails(this.serviceName)
                .then(service => {
                    if (service.state !== this.LogsConstants.SERVICE_STATE_ENABLED) {
                        this.goToHomePage();
                    } else {
                        this.options.load();
                        this.currentOptions.load();
                        this.selectedOffer.load();
                    }
                    return service;
                })
        });
        this.service.load();
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

    updateOptionToOrder (newValue, selectedOption) {
        let option = _.find(this.options.data, {"planCode": selectedOption.planCode});
        if (!_.isEmpty(option)) {
            _.set(option, "quantity", newValue);
        }
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
        return this.selectedOffer.data.reference === this.LogsConstants.basicOffer;
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

    goToHomePage () {
        this.$state.go("dbaas.logs.detail.home");
    }
}

angular.module("managerApp").controller("LogsOptionsCtrl", LogsOptionsCtrl);
