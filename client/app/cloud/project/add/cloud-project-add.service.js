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

    getCloudProjectOrder (orderId, config = { expand: false }) {
        return this.getCloudProjectOrders()
            .then(response => {
                const cloudOrder = _.first(_.filter(response, order => order.orderId === orderId));
                if (!config.expand) {
                    return this.$q.all({ cloudOrder, orderDetail: {} });
                }

                return this.$q.all({ cloudOrder, orderDetail: this.OvhApiMe.Order().Lexi().get({ orderId }).$promise });
            })
            .then(response => _.extend(response.orderDetail, { deliveryStatus: response.cloudOrder.status, serviceName: response.cloudOrder.serviceName }));
    }

    getOrderSummary (description, voucher, payWithCredit) {
        return this._orderCloudProject(description, voucher, payWithCredit)
            .then(response => {
                const promises = {
                    cart: response,
                    orderSummary: this.OvhApiOrder.Cart().Lexi().summary({ cartId: response.cartId }).$promise
                };
                return this.$q.all(promises);
            })
            .then(response => {
                this.OvhApiOrder.Cart().Lexi().delete({ cartId: response.cart.cartId });
                return this.$q.when(response.orderSummary);
            });
    }

    orderCloudProject (description, voucher, payWithCredit) {
        return this._orderCloudProject(description, voucher, payWithCredit)
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

    _orderCloudProject (description, voucher, payWithCredit) {
        return this.OvhApiMe.Lexi().get()
            .$promise
            .then(user => this.OvhApiOrder.Cart().Lexi().post({}, { ovhSubsidiary: user.ovhSubsidiary }).$promise)
            .then(cart => this.OvhApiOrder.Cart().Lexi().assign({ cartId: cart.cartId }).$promise.then(() => cart))
            .then(cart => this.OvhApiOrder.Cart().Product().Lexi().post({ cartId: cart.cartId, productName: "cloud" }, {
                duration: "P1M",
                planCode: "project",
                pricingMode: "default",
                quantity: 1 }).$promise)
            .then(response => this._configureOrder(response, description, voucher));
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

        if (voucher) {
            promises.push(this.OvhApiOrder.Cart().Item().Configuration().Lexi()
                .post({
                    cartId: order.cartId,
                    itemId: order.itemId
                }, {
                    label: "voucher",
                    value: voucher
                }).$promise);
        }

        return this.$q.all(promises)
            .then(() => order);
    }
}

angular.module("managerApp").service("CloudProjectAddService", CloudProjectAddService);
