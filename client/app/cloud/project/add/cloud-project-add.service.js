class CloudProjectAddService {
    constructor ($q, OvhApiCloud, OvhApiMe, OvhApiOrder, OvhApiOrderCatalogFormatted) {
        this.$q = $q;
        this.OvhApiCloud = OvhApiCloud;
        this.OvhApiMe = OvhApiMe;
        this.OvhApiOrder = OvhApiOrder;
        this.OvhApiOrderCatalogFormatted = OvhApiOrderCatalogFormatted;
    }

    getCloudCreditPrice () {
        return this.OvhApiMe.Lexi().get()
            .$promise
            .then(me => this.OvhApiOrderCatalogFormatted.Lexi().get({ catalogName: "cloud", ovhSubsidiary: me.ovhSubsidiary }).$promise)
            .then(catalog => catalog.plans[0].addonsFamily[0].addons[1].plan.details.pricings.default[0].price);
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
                    orderSummary: this.OvhApiOrder.Cart().Lexi().getCheckout({ cartId: response.cartId }).$promise
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
        let cartId = null;
        return this.OvhApiMe.Lexi().get()
            .$promise
            .then(user => this.OvhApiOrder.Cart().Lexi().post({}, { ovhSubsidiary: user.ovhSubsidiary }).$promise)
            .then(cart => {
                cartId = cart.cartId;
                return this.OvhApiOrder.Cart().Lexi().assign({ cartId: cart.cartId }).$promise.then(() => cart);
            })
            .then(cart => this.OvhApiOrder.Cart().Product().Lexi().post({ cartId: cart.cartId, productName: "cloud" }, {
                duration: "P1M",
                planCode: "project",
                pricingMode: "default",
                quantity: 1 }).$promise)
            .then(response => this._configureOrder(response, description, voucher, payWithCredit))
            .catch(error => {
                if (cartId) {
                    this.OvhApiOrder.Cart().Lexi().delete({ cartId });
                }
                return this.$q.reject(error);
            });
    }

    _configureOrder (order, description, voucher, payWithCredit) {
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

        if (payWithCredit) {
            promises.push(this.OvhApiOrder.Cart().Product().Lexi()
                .postOption({
                    cartId: order.cartId,
                    productName: "cloud"
                }, {
                    duration: "P1M",
                    itemId: order.itemId,
                    planCode: "cloud.credit.default",
                    pricingMode: "default",
                    quantity: 1
                }).$promise);
        }

        return this.$q.all(promises)
            .then(() => order);
    }
}

angular.module("managerApp").service("CloudProjectAddService", CloudProjectAddService);
