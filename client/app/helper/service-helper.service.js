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

        errorHandler (message, containerName) {
            return err => {
                if (message) {
                    this.CloudMessage.error(_.isString(message) ? this.$translate.instant(message, err.data) : message, containerName);
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
                    const jsonData = data && data.toJSON ? data.toJSON() : {};
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
                let orderUrl = this.findOrderUrl(data);
                let orderId = this.findOrderId(data);

                if (!orderUrl) {
                    return this.$q.reject("URL not found");
                }
                if (!orderId) {
                    orderId = orderUrl;
                }

                newWindow.location = orderUrl;

                this.CloudMessage.success({
                    textHtml: this.$translate.instant(defaultOrderSuccessMessage, {
                        orderUrl,
                        orderId
                    })
                });
                return this.$q.resolve(data);
            };
        }

        orderErrorHandler (newWindow) {
            return err => {
                newWindow.close();
                this.errorHandler(defaultOrderErrorMessage)(err);
            };
        }

        loadOnNewPage (orderPromise) {
            let newWindow = this.$window.open("", "_blank");
            newWindow.document.write(this.$translate.instant("common_order_doing"));
            return orderPromise
                .then(this.orderSuccessHandler(newWindow))
                .catch(this.orderErrorHandler(newWindow));
        }
    }

    angular.module("managerApp").service("ServiceHelper", ServiceHelper);
})();
