class NashaAddCtrl {
    constructor ($translate, $state, CloudMessage, ControllerHelper, NashaAddService) {
        this.$translate = $translate;
        this.$state = $state;
        this.CloudMessage = CloudMessage;
        this.ControllerHelper = ControllerHelper;
        this.NashaAddService = NashaAddService;

        this.data = {};
        this.messages = {};

        this._initLoaders();
    }

    $onInit () {
        this.data = {
            selectedDatacenter: null,
            selectedModel: null,
            selectedDuration: null,
            order: null
        };

        this._loadMessages();
        this.datacenters.load();
        this.offers.load();
        this.durations.load();
    }

    order () {
        this.NashaAddService.order(this.data)
            .then(response => this.$state.go("paas.nasha-order-complete", { orderUrl: response.url }));
    }

    refreshMessage () {
        this.messages = this.messageHandler.getMessages();
    }

    isLoadingOfferData () {
        return this.datacenters.loading || this.offers.loading || this.durations.loading;
    }

    _initLoaders () {
        this.datacenters = this.ControllerHelper.request.getArrayLoader({
            loaderFunction: () => this.NashaAddService.getAvailableRegions()
        });

        this.offers = this.ControllerHelper.request.getArrayLoader({
            loaderFunction: () => this.NashaAddService.getOffers()
        });

        this.durations = this.ControllerHelper.request.getArrayLoader({
            loaderFunction: () => this.NashaAddService.getDurations()
        });
    }

    _loadMessages () {
        const stateName = "paas.nasha-add";
        this.CloudMessage.unSubscribe(stateName);
        this.messageHandler = this.CloudMessage.subscribe(stateName, {
            onMessage: () => this.refreshMessage()
        });
        this.CloudMessage.info(this.$translate.instant("nasha_order_datacenter_unavailable", { region: this.$translate.instant("nasha_order_datacenter_gra"), fallback: this.$translate.instant("nasha_order_datacenter_rbx") }));
    }
}

angular.module("managerApp").controller("NashaAddCtrl", NashaAddCtrl);
