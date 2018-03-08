class LogsOfferCtrl {
    constructor ($state, $stateParams, $window, ControllerHelper, LogsOfferConstant, LogsOfferService, LogsOrderService, OrderHelperService) {
        this.$state = $state;
        this.$stateParams = $stateParams;
        this.serviceName = this.$stateParams.serviceName;
        this.LogsOfferService = LogsOfferService;
        this.LogsOrderService = LogsOrderService;
        this.ControllerHelper = ControllerHelper;
        this.OrderHelperService = OrderHelperService;
        this.LogsOfferConstant = LogsOfferConstant;
        this.$window = $window;
        this.offerDetail = {
            quantity: 1,
            selectedOffer: "",
            currentOffer: "",
            currentOfferType: "basic"
        };
        this._initLoaders();
    }

    // $onInit () {
// 
    // }

    _initLoaders () {
        this.getSelectedPlan = this.ControllerHelper.request.getArrayLoader({
            loaderFunction: () => this.LogsOfferService.getOffer(this.serviceName)
                .then(selectedPlan => this.selectOffer(selectedPlan))
        });

        this.offers = this.ControllerHelper.request.getArrayLoader({
            loaderFunction: () => this.LogsOrderService.getOrder(this.serviceName)
        });
        this.getSelectedPlan.load();
        this.offers.load();
    }

    selectOffer (offerObj) {
        this.offerDetail.selectedOffer = offerObj.reference;
        this.offerDetail.currentOffer = offerObj.reference;
        if (offerObj.reference !== this.LogsOfferConstant.basicOffer) {
            this.offerDetail.currentOfferType = "pro";
        }
    }

    processOrder () {
        this.savingOffer = this.ControllerHelper.request.getArrayLoader({
            loaderFunction: () => this.LogsOrderService.saveOrder(this.serviceName, this.offerDetail)
                .then(response => this.$window.open(response.order.url, "_self"))
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

    back () {
        if (this.offerDetail.currentOfferType === "pro") {
            this.$state.go("dbaas.logs.detail.home");
        } else {
            this.offerDetail.currentOfferType = "basic";
        }
    }
}

angular.module("managerApp").controller("LogsOfferCtrl", LogsOfferCtrl);
