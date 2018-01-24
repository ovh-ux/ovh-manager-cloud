class LogsOptionsService {
    constructor ($translate, OvhApiOrderCartServiceOption, ServiceHelper, OvhApiDbaasLogs, LogOptionConstant) {
        this.OvhApiOrderCartServiceOption = OvhApiOrderCartServiceOption;
        this.ServiceHelper = ServiceHelper;
        this.$translate = $translate;
        this.OvhApiDbaasLogs = OvhApiDbaasLogs;
        this.LogOptionConstant = LogOptionConstant;
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
            productName: "logs",
            serviceName
        }).$promise
            .then(response => {
                _.map(response, option => {
                    option.quantity = 0;
                    option.price = option.prices[0].price.value;
                    option.priceText = option.prices[0].price.text;
                    option.type = this.$translate.instant(`${option.planCode}-type`);
                    option.detail = this.$translate.instant(`${option.planCode}-detail`);
                });
                return response;
            })
            .catch(this.ServiceHelper.errorHandler("logs_options_options_loading_error"));
    }

    /**
     * returns the total price according to the quantity selected for each option
     *
     * @param {any} options
     * @returns the total price of the selected options
     * @memberof LogsOptionsService
     */
    getTotalPrice (options) {
        return _.reduce(options, (total, option) => total + option.quantity * option.price, 0).toFixed(2);
    }

    /**
     * returns the list of options that have been subscribed in the service
     *
     * @param {any} serviceName
     * @returns promise that resolves with the array of options which have been subscribed
     * @memberof LogsOptionsService
     */
    getSubscribedOptions (serviceName) {
        const self = this;
        return this.OvhApiDbaasLogs.Accounting().Aapi().me({
            serviceName
        }).$promise
            .then(response => {
                const optionsCountMap = _.reduce(response.options, (optionsMap, option) => {
                    optionsMap[option.reference] = optionsMap[option.reference] ? ++optionsMap[option.reference] : 1;
                    return optionsMap;
                }, {});

                return _.map(_.keys(optionsCountMap), option => {
                    const optionConfig = {};
                    optionConfig.type = self.$translate.instant(`${option}-type`);
                    optionConfig.detail = self.$translate.instant(`${option}-detail`);
                    optionConfig.quantity = optionsCountMap[option];
                    return optionConfig;
                });
            })
            .catch(this.ServiceHelper.errorHandler("logs_options_current_options_loading_error"));
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

    /**
     * returns the order url that can be used to order the options
     *
     * @param {any} serviceName
     * @returns the order url. This url has the selected options as arguments
     * @memberof LogsOptionsService
     */
    getOrderURL (options, serviceName) {
        const products = this.getOptionsToOrder(options)
            .map(option => ({
                planCode: option.planCode,
                quantity: option.quantity,
                serviceName,
                productId: "logs"
            }));

        let orderBaseUrl;
        if (window.location.host === this.LogOptionConstant.USHost) {
            orderBaseUrl = this.LogOptionConstant.orderBaseURL.US;
        }
        orderBaseUrl = orderBaseUrl || this.LogOptionConstant.orderBaseURL.restOfWorld;

        return "{orderBaseUrl}?products={products}"
            .replace("{orderBaseUrl}", orderBaseUrl)
            .replace("{products}", window.JSURL.stringify(products));
    }
}

angular.module("managerApp").service("LogsOptionsService", LogsOptionsService);
