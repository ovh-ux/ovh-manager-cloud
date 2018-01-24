class LogsOptionsService {
    constructor ($translate, OvhApiOrderCartServiceOption, ServiceHelper, OvhApiDbaasLogs, LogOptionConstant) {
        this.OvhApiOrderCartServiceOption = OvhApiOrderCartServiceOption;
        this.ServiceHelper = ServiceHelper;
        this.$translate = $translate;
        this.OvhApiDbaasLogs = OvhApiDbaasLogs;
        this.LogOptionConstant = LogOptionConstant;
    }

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

    getTotalPrice (options) {
        return _.reduce(options, (total, option) => total + option.quantity * option.price, 0).toFixed(2);
    }

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

    getOptionsToOrder (options) {
        return _.filter(options, option => option.quantity > 0);
    }

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
