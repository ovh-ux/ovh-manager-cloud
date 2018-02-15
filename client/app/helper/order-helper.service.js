class OrderHelperService {
    constructor ($httpParamSerializerJQLike, OvhApiMe) {
        this.$httpParamSerializerJQLike = $httpParamSerializerJQLike;
        this.User = OvhApiMe;
    }

    openExpressOrderUrl (config, urlParams = {}) {
        this.getExpressOrderUrl(config, urlParams)
            .then(href => {
                location.href = href;
            });
    }

    getUrlConfigPart (config, urlParams = {}) {
        let formattedConfig = config;
        if (!_.isArray(config)) {
            // Transform configuration and option value if necessary
            formattedConfig = _.assign({}, config);
            if (formattedConfig.configuration && !_.isArray(formattedConfig.configuration)) {
                formattedConfig.configuration = this.transformToOrderValues(formattedConfig.configuration);
            }

            if (formattedConfig.option) {
                const formattedOptions = formattedConfig.option.map(option => {
                    if (option.configuration && !_.isArray(option.configuration)) {
                        option.configuration = this.transformToOrderValues(option.configuration);
                    }
                    return option;
                });
                formattedConfig.option = formattedOptions;
            }
            formattedConfig = [formattedConfig];
        }

        const paramsPart = this.$httpParamSerializerJQLike(_.assign({}, urlParams, {
            products: JSURL.stringify(formattedConfig)
        }));

        return paramsPart;
    }

    /**
     * Transform an object to an Order compliant array
     * @param  {[Object} config plain json
     * @return {Array}          an array compatible with Order
     */
    transformToOrderValues (config) {
        let orderConfig = [];
        _.forEach(_.keys(config), key => {
            const configParam = {
                label: key
            };
            if (_.isArray(config[key])) {
                configParam.values = config[key];
            } else {
                configParam.values = [config[key]];
            }
            orderConfig.push(configParam);
        });
        return orderConfig;
    }

    getExpressOrderUrl (config, urlParams = {}) {
        const path = "/order/express/#/new/express/resume";
        const paramsPart = this.getUrlConfigPart(config, urlParams);
        return this.buildUrl(`${path}?${paramsPart}`);
    }

    buildUrl (path) {
        // Maybe this could be put in configuration
        return this.User.Lexi().get()
            .$promise
            .then(user => {
                let targetURL;
                switch (user.ovhSubsidiary) {
                    case "FR":
                        targetURL = "https://www.ovh.com/fr";
                        break;
                    case "ASIA":
                        targetURL = "https://ca.ovh.com/asia";
                        break;
                    case "CA":
                        targetURL = "https://ca.ovh.com/en";
                        break;
                    case "SG":
                        targetURL = "https://ca.ovh.com/sg";
                        break;
                    case "WS":
                        targetURL = "https://us.ovh.com/es";
                        break;
                    case "WE":
                        targetURL = "https://ca.ovh.com/en";
                        break;
                    case "QC":
                        targetURL = "https://ca.ovh.com/fr";
                        break;
                    default:
                        targetURL = "https://www.ovh.com/fr";
                }

                return `${targetURL}${path}`;
            });
    }
}

angular.module("managerApp").service("OrderHelperService", OrderHelperService);
