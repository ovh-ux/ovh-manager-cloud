class NashaAddService {
    constructor ($q, $translate, OrderHelperService, OvhApiOrder, ServiceHelper) {
        this.$q = $q;
        this.$translate = $translate;
        this.OrderHelperService = OrderHelperService;
        this.OvhApiOrder = OvhApiOrder;
        this.ServiceHelper = ServiceHelper;
    }

    getAvailableRegions () {
        return this.OvhApiOrder.Lexi().schema()
            .$promise
            .then(response => _.filter(response.models["dedicated.NasHAZoneEnum"].enum, datacenter => datacenter !== "gra"))
            .catch(this.ServiceHelper.errorHandler("nasha_order_loading_error"));
    }

    getOffers () {
        return this.OvhApiOrder.Cart().Product().Lexi().get({ cartId: "6f111f20-61f3-476c-b38e-58684c7ded7b", productName: "nasha" })
            .$promise
            .then(response => {
                _.forEach(response, offer => {
                    offer.productName = this.$translate.instant(`nasha_order_nasha_${offer.planCode}`);
                });
                return response;
            })
            .catch(this.ServiceHelper.errorHandler("nasha_order_loading_error"));
    }

    getDurations () {
        return this.$q.when([{
            value: 1,
            text: `01 ${this.$translate.instant("nas_order_month")}`
        }, {
            value: 3,
            text: `03 ${this.$translate.instant("nas_order_month")}`
        }, {
            value: 6,
            text: `06 ${this.$translate.instant("nas_order_month")}`
        }, {
            value: 12,
            text: `12 ${this.$translate.instant("nas_order_month")}`
        }]);
    }

    order (model) {
        return this.OrderHelperService.getExpressOrderUrl({
            productId: "nasha",
            duration: `P${model.selectedDuration}M`,
            planCode: model.selectedModel,
            pricingMode: "default",
            quantity: 1,
            configuration: [{
                label: "datacenter",
                values: [model.selectedDatacenter.toUpperCase()]
            }]
        })
            .then(response => ({ url: response }))
            .catch(this.ServiceHelper.errorHandler("nasha_order_validation_error"));
    }
}

angular.module("managerApp").service("NashaAddService", NashaAddService);
