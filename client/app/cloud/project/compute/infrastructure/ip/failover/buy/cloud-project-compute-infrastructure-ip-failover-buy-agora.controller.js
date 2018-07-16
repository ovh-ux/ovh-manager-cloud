"use strict";

angular.module("managerApp").controller("CloudProjectComputeInfrastructureIpFailoverBuyAgoraCtrl", function ($http, $q, $stateParams, $translate, $uibModalInstance, $window, CloudMessage) {

    var self = this;

    function init () {
        self.loading = true;
        self.product = null;
        self.quantity = 1;
        self.country = null;
        return getIpfoCatalog().then((catalog) => {
            self.catalog = catalog;
            self.product = _.first(catalog);
            self.country = _.first(self.getCountries(self.product));
        }).catch((err) => {
            CloudMessage.error([$translate.instant("cpciif_buy_init_error"), err.data && err.data.message || ""].join(" "));
            $uibModalInstance.dismiss();
            return $q.reject(err);
        }).finally(() => {
            self.loading = false;
        });
    }

    function getIpfoCatalog () {
        return $http.get("/order/catalog/formatted/ip", {
            serviceType: "apiv6",
            params: {
                ovhSubsidiary: "US"
            }
        }).then((result) => {
            if (result.status !== 200) {
                return $q.reject(result);
            }
            return _.filter(_.get(result, "data.plans"), (offer) => {
                return /failover/.test(offer.planCode);
            });
        });
    }

    self.getPrice = (product) => {
        return _.chain(product)
                .get("details.pricings.default")
                .filter((p) => p.capacities.indexOf("installation") >= 0)
                .first()
                .get("price")
                .value();
    };

    self.getCountries = (product) => {
        return _.chain(product)
                .get("details.product.configurations")
                .find({ name: "country" })
                .get("values")
                .value();
    };

    self.getMaximumQuantity = (product) => {
        return _.chain(product)
                .get("details.pricings.default")
                .filter((p) => angular.isNumber(p.maximumQuantity), "maximumQuantity")
                .min("maximumQuantity")
                .get("maximumQuantity")
                .value();
    };

    self.order = () => {
        const order = {
            planCode: self.product.planCode,
            productId: "ip",
            pricingMode: "default",
            quantity: self.quantity,
            configuration: [{
                label: "country",
                value: self.country
            }, {
                label: "destination",
                value: $stateParams.projectId
            }]
        };
        $window.open(`https://ovh.us/order/express/#/express/review?products=${JSURL.stringify([order])}`, "_blank");
        $uibModalInstance.dismiss();
    };

    self.cancel = $uibModalInstance.dismiss;

    init();
});
