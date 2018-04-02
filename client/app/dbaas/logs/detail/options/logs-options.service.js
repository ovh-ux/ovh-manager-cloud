class LogsOptionsService {
    constructor ($translate, $window, ControllerHelper, OvhApiOrderCartServiceOption, ServiceHelper, OvhApiDbaasLogs, LogsOfferService, LogOptionConstant) {
        this.ControllerHelper = ControllerHelper;
        this.OvhApiOrderCartServiceOption = OvhApiOrderCartServiceOption;
        this.ServiceHelper = ServiceHelper;
        this.$translate = $translate;
        this.$window = $window;
        this.OvhApiDbaasLogs = OvhApiDbaasLogs;
        this.LogsOfferService = LogsOfferService;
        this.LogOptionConstant = LogOptionConstant;
    }

    /**
     * returns the transformed option. Meant to be used for the available options
     *
     * @param {any} option
     * @returns the transformed option
     * @memberof LogsOptionsService
     */
    _transformOption (option) {
        option.quantity = 0;
        option.price = option.prices[0].price.value;
        option.priceText = option.prices[0].price.text;
        option.type = this.$translate.instant(`${option.planCode}-type`);
        option.detail = this.$translate.instant(`${option.planCode}-detail`);
    }

    _transformOffer (offer) {
        const offerPrefix = this.$translate.instant("log_options_pro_offer");
        const offerName = this.$translate.instant(offer.reference);
        const streams = this.$translate.instant("logs_offer_streams");
        const dashboards = this.$translate.instant("logs_offer_tables");
        const inputs = this.$translate.instant("logs_offer_collection_tools");
        offer.name = `${offerPrefix} ${offerName}`;
        offer.streams = `${offer.maxNbStream} ${streams}`;
        offer.dashboards = `${offer.maxNbDashboard} ${dashboards}`;
        offer.inputs = `${offer.maxNbInput} ${inputs}`;
        return offer;
    }

    getOffer (serviceName) {
        return this.LogsOfferService.getOffer(serviceName)
            .then(offer => this._transformOffer(offer));
    }

    /**
     * returns the list of options available for selection
     *
     * @param {any} serviceName
     * @returns promise which will be resolve to an array of options objects
     * @memberof LogsOptionsService
     */
    getOptions (serviceName) {
        return this.OvhApiOrderCartServiceOption.Lexi().get({
            productName: this.LogOptionConstant.productName,
            serviceName
        }).$promise
            .then(response => {
                _.each(response, option => this._transformOption(option));
                return response.sort((optionA, optionB) => optionA.type === optionB.type ? this.ControllerHelper.naturalCompare(optionA.detail, optionB.detail) : this.ControllerHelper.naturalCompare(optionA.type, optionB.type));
            })
            .catch(err => this.LogsHelperService.handleError("logs_options_options_loading_error", err, {}));
    }

    /**
     * returns the transformed option, which has the count for each of the options.
     * Meant to be used for the subscribed options
     *
     * @param {any} option
     * @param {any} optionsCountMap
     * @returns the transformed option
     * @memberof LogsOptionsService
     */
    transformSubscribedOption (option, optionsCountMap) {
        const optionConfig = {};
        optionConfig.id = option;
        optionConfig.type = this.$translate.instant(`${option}-type`);
        optionConfig.detail = this.$translate.instant(`${option}-detail`);
        optionConfig.quantity = optionsCountMap[option];
        return optionConfig;
    }

    /**
     * makes API call to get the list of options that have been subscribed in the service
     *
     * @param {any} serviceName
     * @returns promise that resolves with the array of options which have been subscribed
     * @memberof LogsOptionsService
     */
    getSubscribedOptions (serviceName) {
        return this.OvhApiDbaasLogs.Accounting().Aapi().me({
            serviceName
        })
            .$promise
            .catch(err => this.LogsHelperService.handleError("logs_options_current_options_loading_error", err, {}));
    }

    /**
     * returns map of all subscribed options with their count.
     *
     * @param {any} serviceName
     * @returns map of subscribed option with count
     * @memberof LogsOptionsService
     */
    getSubscribedOptionsMap (serviceName) {
        return this.getSubscribedOptions(serviceName)
            .then(response => {
                // Build a map of option vs no. of subscribed instances
                const optionsCountMap = _.reduce(response.options, (optionsMap, option) => {
                    optionsMap[option.reference] = optionsMap[option.reference] ? ++optionsMap[option.reference] : 1;
                    return optionsMap;
                }, {});
                // Build a new data structure with the option information and the no.of instances subscribed
                return _.map(_.keys(optionsCountMap), option => this.transformSubscribedOption(option, optionsCountMap))
                    .sort((optionA, optionB) => optionA.type === optionB.type ? this.ControllerHelper.naturalCompare(optionA.detail, optionB.detail) : this.ControllerHelper.naturalCompare(optionA.type, optionB.type));
            });
    }

    getSubscribedOptionsMapGrouped (serviceName) {
        return this.getSubscribedOptionsMap(serviceName)
            .then(options => {
                const groupedOptionsMap = options.reduce((groupedOptions, option) => {
                    groupedOptions[option.type] = groupedOptions[option.type] ? groupedOptions[option.type] : { type: option.type, quantity: 0, details: [] };
                    groupedOptions[option.type].quantity += option.quantity * this.LogOptionConstant.PRODUCT_COUNT[option.id];
                    groupedOptions[option.type].details.push(option);
                    return groupedOptions;
                }, {});
                return Object.keys(groupedOptionsMap).map(groupedOptionsName => groupedOptionsMap[groupedOptionsName])
                    .sort((optionA, optionB) => this.ControllerHelper.naturalCompare(optionA.type, optionB.type));
            });
    }

    /**
     * returns all subscribed options with reference "logs-stream".
     *
     * @param {any} serviceName
     * @returns array of all subscribed option objects belonging to streams
     * @memberof LogsOptionsService
     */
    getSubscribedOptionsByType (serviceName, optionType) {
        return this.getSubscribedOptions(serviceName)
            .then(response => {
                switch (optionType) {
                    case this.LogOptionConstant.STREAM_OPTION_REFERENCE:
                        return this._filterOptions(response.options, "maxNbStream");
                    case this.LogOptionConstant.INDEX_OPTION_REFERENCE:
                        return this._filterOptions(response.options, "maxNbIndex");
                    case this.LogOptionConstant.ALIAS_OPTION_REFERENCE:
                        return this._filterOptions(response.options, "maxNbAlias");
                    case this.LogOptionConstant.INPUT_OPTION_REFERENCE:
                        return this._filterOptions(response.options, "maxNbInput");
                    case this.LogOptionConstant.ROLE_OPTION_REFERENCE:
                        return this._filterOptions(response.options, "maxNbRole");
                    case this.LogOptionConstant.DASHBOARD_OPTION_REFERENCE:
                        return this._filterOptions(response.options, "maxNbDashboard");
                    default:
                        return response.options;
                }
            });
    }

    /**
     * returns the list of options that have to be ordered (quantity > 0)
     *
     * @param {any} serviceName
     * @returns the list of options to be ordered
     * @memberof LogsOptionsService
     */
    getOptionsToOrder (options) {
        return _.filter(options, option => option.quantity > 0);
    }

    _filterOptions (options, max) {
        return options
            .filter(option => option[max] > 0)
            .map(option => {
                option.type = this.$translate.instant(`${option.reference}-type`);
                option.detail = this.$translate.instant(`${option.reference}-detail`);
                return option;
            });
    }

    /**
     * returns the transformed option. Meant to be used to construct the order URL
     *
     * @param {any} option
     * @returns the transformed option
     * @memberof LogsOptionsService
     */
    _transformOptionForOrder (option, serviceName) {
        return {
            planCode: option.planCode,
            quantity: option.quantity,
            serviceName,
            productId: this.LogOptionConstant.productName
        };
    }
    /**
     * returns the options configuration using which the order url can be constructed
     *
     * @param {any} options
     * @param {any} serviceName
     * @returns returns the options configuration to be used to construct the order url
     * @memberof LogsOptionsService
     */
    getOrderConfiguration (options, serviceName) {
        const optionsToOrder = this.getOptionsToOrder(options);
        return _.map(optionsToOrder, option => this._transformOptionForOrder(option, serviceName));
    }
}

angular.module("managerApp").service("LogsOptionsService", LogsOptionsService);
