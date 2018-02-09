class CloudProjectAddService {
    constructor ($q, OvhApiCloud, OvhApiMe, OvhApiOrder) {
        this.$q = $q;
        this.OvhApiCloud = OvhApiCloud;
        this.OvhApiMe = OvhApiMe;
        this.OvhApiOrder = OvhApiOrder;
    }

    getCloudProjectOrders () {
        return this.OvhApiCloud.Lexi().order().$promise;
    }

    getCloudProjectOrder (orderId) {
        return this.getCloudProjectOrders()
            .then(response => _.first(_.filter(response, order => order.orderId === orderId)));
    }

    orderCloudProject (description, voucher) {
        return this.OvhApiMe.Lexi().get()
            .$promise
            .then(user => this.OvhApiOrder.Cart().Lexi().post({}, { ovhSubsidiary: user.ovhSubsidiary }).$promise)
            .then(cart => this.OvhApiOrder.Cart().Lexi().assign({ cartId: cart.cartId }).$promise.then(() => cart))
            .then(cart => this.OvhApiOrder.Cart().Product().Lexi().post({ cartId: cart.cartId, productName: "cloud" }, {
                duration: "P1M",
                planCode: "project",
                pricingMode: "default",
                quantity: 1 }).$promise)
            .then(response => this._configureOrder(response, description, voucher))
            .then(response => this.OvhApiOrder.Cart().Lexi().checkout({ cartId: response.cartId }).$promise)
            .then(response => {
                if (!response.prices.withTax.value) {
                    return this.OvhApiMe.Order().Lexi().payRegisteredPaymentMean({ orderId: response.orderId }, { paymentMean: "fidelityAccount" })
                        .$promise
                        .then(() => response);
                }
                return this.$q.when(response);
            });
    }

    _configureOrder (order, description, voucher) {
        const promises = [];
        if (description) {
            promises.push(this.OvhApiOrder.Cart().Item().Configuration().Lexi()
                .post({
                    cartId: order.cartId,
                    itemId: order.itemId
                }, {
                    label: "description",
                    value: description
                }).$promise);
        }

        const total = _.filter(order.prices, price => price.label === "TOTAL")[0];
        if (voucher && total.price.value) {
            promises.push(this.OvhApiOrder.Cart().Item().Configuration().Lexi()
                .post({
                    cartId: order.cartId,
                    itemId: order.itemId
                }, {
                    label: "voucher",
                    value: voucher.voucher
                }).$promise);
        }

        return this.$q.all(promises)
            .then(() => order);
    }
}

angular.module("managerApp").service("CloudProjectAddService", CloudProjectAddService);
