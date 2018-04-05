class VpsOrderDiskCtrl {
    constructor ($filter, $stateParams, $state, $translate, $q, $window, CloudMessage, CloudNavigation, VpsService,
                 ServiceHelper) {
        this.$filter = $filter;
        this.$translate = $translate;
        this.$q = $q;
        this.$window = $window;
        this.CloudMessage = CloudMessage;
        this.CloudNavigation = CloudNavigation;
        this.serviceName = $stateParams.serviceName;
        this.VpsService = VpsService;
        this.ServiceHelper = ServiceHelper;

        this.loaders = {
            capacity: false,
            offer: false,
            order: false
        };

        this.model = {
            capacity: null,
            duration: null,
            url: null,
            contractsValidated: null
        };
        this.capacityArray = [];
        this.offer = null;

    }

    $onInit () {
        this.previousState = this.CloudNavigation.getPreviousState();
    }

    getAdditionalDiskPrices () {
        this.loaders.capacity = true;
        this.VpsService.getAdditionalDiskPrices(this.serviceName)
            .then(data => { this.capacityArray = data; })
            .catch(error => this.CloudMessage.error(error || this.$translate.instant("vps_order_additional_disk_fail")))
            .finally(() => { this.loaders.capacity = false; })
    }

    getAdditionalDiskFinalPrice () {
        this.loaders.offer = true;
        this.VpsService.getAllowedDuration(this.serviceName, this.model.capacity)
            .then(duration => {
                this.model.duration = duration;
                this.VpsService.getAdditionalDiskFinalPrice(this.serviceName, this.model.capacity, this.model.duration)
                    .then(offer => { this.offer = offer; })
                    .catch(error => this.CloudMessage.error(error || this.$translate.instant("vps_order_additional_disk_fail")))
                    .finally(() => { this.loaders.offer = false; })
            })
            .catch(error => this.CloudMessage.error(error || this.$translate.instant("vps_order_additional_disk_fail")));
    }

    orderAdditionalDiskOption () {
        this.loaders.order = true;
        this.ServiceHelper.loadOnNewPage(this.VpsService.postAdditionalDiskOrder(this.serviceName, this.model.capacity, this.model.duration))
            .then(({ url }) => {
                this.model.url = url;
            })
            .finally(() => {
                this.loaders.order = false;
            });
    }

    cancel () {
        this.previousState.go();
    }

    confirm () {
        this.orderAdditionalDiskOption();
    }

    displayBC () {
        this.$window.open(
            this.model.url,
            "_blank"
        );
    }

}

angular.module("managerApp").controller("VpsOrderDiskCtrl", VpsOrderDiskCtrl);
