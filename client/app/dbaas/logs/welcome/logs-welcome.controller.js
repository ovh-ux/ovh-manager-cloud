class LogsWelcomeCtrl {
    constructor ($state, LogsConstants, OrderHelperService, ovhDocUrl) {
        this.$state = $state;
        this.LogsConstants = LogsConstants;
        this.OrderHelperService = OrderHelperService;
        this.ovhDocUrl = ovhDocUrl;
        this.urls = {};
    }

    $onInit () {
        this.urls.docsUrl = this.ovhDocUrl.getDocUrl(this.LogsConstants.LOGS_DOCS_NAME);
        this.OrderHelperService.buildUrl(this.LogsConstants.LOGS_PRODUCT_URL)
            .then(url => {
                this.urls.productURL = url;
            });
        this.OrderHelperService.buildUrl(this.LogsConstants.ORDER_URL)
            .then(url => {
                this.urls.orderURL = url;
            });
    }
}

angular.module("managerApp").controller("LogsWelcomeCtrl", LogsWelcomeCtrl);
