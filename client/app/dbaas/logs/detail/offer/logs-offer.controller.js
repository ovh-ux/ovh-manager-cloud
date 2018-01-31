class LogsOfferCtrl {
    constructor ($stateParams, $window, ControllerHelper, LogsOfferService, LogsOrderService, OrderHelperService) {
        this.$stateParams = $stateParams;
        this.serviceName = this.$stateParams.serviceName;
        this.LogsOfferService = LogsOfferService;
        this.LogsOrderService = LogsOrderService;
        this.ControllerHelper = ControllerHelper;
        this.OrderHelperService = OrderHelperService;
        this.$window = $window;
        this.offerDetail = {
            quantity: 1,
            selectedOffer: "",
            currentOffer: "",
        };
        this._initLoaders();
    }

    $onInit () {
        this.getSelectedPlan.load();
        this.offers.load();
    }

    _initLoaders () {
        this.getSelectedPlan = this.ControllerHelper.request.getArrayLoader({
            loaderFunction: () => this.LogsOfferService.getOffer(this.serviceName)
                .then(selectedPlan => this.selectOffer(selectedPlan))
        });

        this.offers = this.ControllerHelper.request.getArrayLoader({
            loaderFunction: () => this.LogsOrderService.getOrder(this.serviceName)
        });
    }

    selectOffer (offerObj) {
        this.offerDetail.selectedOffer = offerObj.reference;
        this.offerDetail.currentOffer = offerObj.reference;
    }

    saveOffer () {
        this.savingOffer = this.ControllerHelper.request.getArrayLoader({
            loaderFunction: () => this.LogsOrderService.saveOrder(this.serviceName, this.offerDetail)
                .then(response => this.$window.open(response.data.order.url, "_self"))
        });
        this.savingOffer.load();
    }
}

angular.module("managerApp").controller("LogsOfferCtrl", LogsOfferCtrl);
