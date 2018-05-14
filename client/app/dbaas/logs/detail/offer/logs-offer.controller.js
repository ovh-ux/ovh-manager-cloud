class LogsOfferCtrl {
    constructor ($state, $stateParams, $window, ControllerHelper, LogsConstants, LogsOfferService, LogsOrderService, OrderHelperService, LogsDetailService) {
        this.$state = $state;
        this.$stateParams = $stateParams;
        this.serviceName = this.$stateParams.serviceName;
        this.LogsOfferService = LogsOfferService;
        this.LogsOrderService = LogsOrderService;
        this.ControllerHelper = ControllerHelper;
        this.OrderHelperService = OrderHelperService;
        this.LogsDetailService = LogsDetailService;
        this.LogsConstants = LogsConstants;
        this.$window = $window;
        this.offerDetail = {
            quantity: 1,
            selectedOffer: "",
            currentOffer: "",
            currentOfferType: "basic"
        };
        this._initLoaders();
    }

    _initLoaders () {
        this.getSelectedPlan = this.ControllerHelper.request.getArrayLoader({
            loaderFunction: () => this.LogsOfferService.getOffer(this.serviceName)
                .then(selectedPlan => this.selectOffer(selectedPlan))
        });

        this.offers = this.ControllerHelper.request.getArrayLoader({
            loaderFunction: () => this.LogsOrderService.getOrder(this.serviceName)
        });

        this.service = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () => this.LogsDetailService.getServiceDetails(this.serviceName)
                .then(service => {
                    if (service.state !== this.LogsConstants.SERVICE_STATE_ENABLED) {
                        this.goToHomePage();
                    } else {
                        this.getSelectedPlan.load();
                        this.offers.load();
                    }
                    return service;
                })
        });
        this.service.load();
    }

    selectOffer (offerObj) {
        this.offerDetail.selectedOffer = offerObj.reference;
        this.offerDetail.currentOffer = offerObj.reference;
        if (offerObj.reference !== this.LogsConstants.basicOffer) {
            this.offerDetail.currentOfferType = "pro";
        }
    }

    processOrder () {
        this.savingOffer = this.ControllerHelper.request.getArrayLoader({
            loaderFunction: () => this.LogsOrderService.saveOrder(this.serviceName, this.offerDetail)
                .then(response => this.$window.open(response.order.url, "_target"))
                .catch(() => this.ControllerHelper.scrollPageToTop())
                .finally(() => this.back())
        });
        this.savingOffer.load();
    }

    saveOffer () {
        if (this.offerDetail.selectedOffer === this.offerDetail.currentOffer) {
            this.LogsOfferService.showWarning();
        } else {
            this.processOrder();
        }
    }

    orderPro () {
        this.offerDetail.currentOfferType = "upgrade";
    }

    goToHomePage () {
        this.$state.go("dbaas.logs.detail.home");
    }

    back () {
        if (this.offerDetail.currentOfferType === "pro") {
            this.goToHomePage();
        } else {
            this.offerDetail.currentOfferType = "basic";
        }
    }
}

angular.module("managerApp").controller("LogsOfferCtrl", LogsOfferCtrl);
