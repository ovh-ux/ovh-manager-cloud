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

        errorHandler (messageInput, containerName, messageDetailsPath = "data.message") {
            return err => {
                let errorMessageConfig = {};

                let apiMessage = _.get(err, messageDetailsPath, err.message);
                if (apiMessage) {
                    errorMessageConfig.apiMessage = apiMessage;
                }

                if (_.isString(messageInput)) {
                    errorMessageConfig.textToTranslate = messageInput;
                } else if (_.has(messageInput, "text")) {
                    errorMessageConfig.text = messageInput.text;
                } else if (_.has(messageInput, "textHtml")) {
                    errorMessageConfig.textHtml = messageInput.textHtml;
                } else if (_.has(messageInput, "translateParams")) {
                    errorMessageConfig.textToTranslate = messageInput.textToTranslate;
                    errorMessageConfig.translateParams = messageInput.translateParams;
                } else {
                    errorMessageConfig.textToTranslate = defaultErrorMessage;
                }

                let message = this.buildErrorMessage(errorMessageConfig);

                this.CloudMessage.error(message, containerName);

                return this.$q.reject(err);
            };
        }

        buildErrorMessage (config) {
            let message = {
                text: null,
                textHtml: null
            };

            if (config.text) {
                message.text = config.text;
            }
            if (config.textHtml) {
                message.textHtml = config.textHtml;
            }

            if (config.translateParams) {
                message.text = this.$translate.instant(config.textToTranslate, config.translateParams);
            } else if (config.textToTranslate) {
                message.text = this.$translate.instant(config.textToTranslate);
            }

            if (config.apiMessage) {
                message.text = `${message.text} ${config.apiMessage}`;
            }
            return message;
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

        getTaskProgressType (taskType) {
            switch (taskType) {
                case "done":
                    return "success";
                case "error":
                    return "error";
                case "doing":
                case "todo":
                case "paused":
                    return "info";
                default:
                    return "warning";
            }
        }
    }

    angular.module("managerApp").service("ServiceHelper", ServiceHelper);
})();
