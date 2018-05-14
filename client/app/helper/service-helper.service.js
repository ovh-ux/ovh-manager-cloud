(() => {
    const defaultSuccessMessage = "common_global_success";
    const defaultErrorMessage = "common_global_error";
    const defaultOrderSuccessMessage = "common_order_success";
    const defaultOrderErrorMessage = "common_order_error";

    class ServiceHelper {
        constructor ($q, $translate, $window, CloudMessage) {
            this.$q = $q;
            this.$translate = $translate;
            this.CloudMessage = CloudMessage;
            this.$window = $window;
        }

        errorHandler (message, containerName, messageParams) {
            return err => {
                if (message) {
                    this.CloudMessage.error(_.isString(message) ? this.$translate.instant(message)+' ' + _.get(err, messageParams, err.data) : message, containerName);
                } else if (err.message) {
                    this.CloudMessage.error(err.message, containerName);
                } else {
                    // Default error message
                    this.CloudMessage.error(this.$translate.instant(defaultErrorMessage), containerName);
                }

                return this.$q.reject(err);
            };
        }

        successHandler (message, containerName) {
            return data => {
                if (message) {
                    const jsonData = data ? data.toJSON ? data.toJSON() : data : {};
                    this.CloudMessage.success(_.isString(message) ? this.$translate.instant(message, jsonData) : message, containerName);
                } else {
                    // Default success message
                    this.CloudMessage.success(this.$translate.instant(defaultSuccessMessage), containerName);
                }

                return data;
            };
        }

        findOrderId (data) {
            let orderId = _.get(data, "order.orderId");
            if (!orderId) {
                let matches = data.url.match(/orderId=(\d+)/);
                if (matches.length > 0) {
                    orderId = matches[1];
                }
            }

            return orderId;
        }

        findOrderUrl (data) {
            let url = _.get(data, "order.url");
            if (!url) {
                url = _.get(data, "url");
            }
            return url;
        }

        orderSuccessHandler (newWindow) {
            return data => {
                const orderUrl = this.findOrderUrl(data);
                let orderId = this.findOrderId(data);

                if (!orderUrl) {
                    return this.$q.reject({
                        data: {
                            message: "URL not found"
                        }
                    });
                }
                if (!orderId) {
                    orderId = orderUrl;
                }

                newWindow.location = orderUrl;

                return this.$q.resolve({
                    orderUrl,
                    orderId
                });
            };
        }

        orderSuccessMessage ({ orderUrl, orderId }, message = defaultOrderSuccessMessage) {
            this.CloudMessage.success({
                textHtml: this.$translate.instant(message, {
                    orderUrl,
                    orderId
                })
            });
        }

        orderErrorHandler (newWindow) {
            return err => {
                newWindow.close();
                this.errorHandler(defaultOrderErrorMessage)(err);
            };
        }

        loadOnNewPage (orderPromise, config = {}) {
            let newWindow = this.$window.open("", "_blank");
            newWindow.document.write(this.$translate.instant("common_order_doing"));
            return orderPromise
                .then(this.orderSuccessHandler(newWindow))
                .then(data => {
                    if (_.isFunction(config.successMessage)) {
                        return config.successMessage(data);
                    }
                    if (_.isString(config.successMessage)) {
                        return this.orderSuccessMessage(data, config.successMessage);
                    }
                    return this.orderSuccessMessage(data);
                })
                .catch(this.orderErrorHandler(newWindow));
        }
    }

    angular.module("managerApp").service("ServiceHelper", ServiceHelper);
})();
