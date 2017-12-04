class OrderAdditionalDiskCtrl {
    constructor ($translate, $uibModalInstance, CloudMessage, VpsService) {
        this.$translate = $translate;
        this.$uibModalInstance = $uibModalInstance;
        this.CloudMessage = CloudMessage;
        this.VpsService = VpsService;

        this.capacityArray = [];
        this.loader = {
            capacity: false,
            offer: false,
            save: false
        };
        this.model = {
            agree: {
                value: false
            },
            capacity: null,
            date: null,
            duration: null
        };
        this.offer = null;

        this.step = {
            one: false,
            two: false
        };
    }

    $onInit () {
        this.step.one = true;
        this.getAdditionalDiskPrices();
    }

    getAdditionalDiskPrices () {
        this.loader.capacity = true;
        this.VpsService.getAdditionalDiskPrices()
            .then(data => { this.capacityArray = data })
            .catch(() => this.CloudMessage.error(this.$translate.instant("vps_order_additional_disk_fail")))
            .finally(() => { this.loader.capacity = false });
    }

    getAdditionalDiskFinalPrice () {
        this.loader.offer = true;
        this.VpsService.getAllowedDuration(this.model.capacity)
            .then(duration => {
                this.model.duration = duration;
                this.VpsService.getAdditionalDiskFinalPrice(this.model.capacity, this.model.duration)
                    .then(data => { this.offer = data })
                    .catch(() => this.CloudMessage(this.$translate.instant("vps_order_additional_disk_fail")))
                    .finally(() => { this.loader.offer = false });
            })
            .catch(() => this.CloudMessage(this.$translate.instant("vps_order_additional_disk_fail")))
            .finally(() => {
                let date = this.model.duration;
                date = date.replace(/[a-zA-Z]*-/, "");
                this.model.date = moment(date).format("L");
                this.loader.offer = false;
            });
    }

    next () {
        this.step.one = false;
        this.step.two = true;
        this.getAdditionalDiskFinalPrice();
    }


    cancel () {
        this.$uibModalInstance.dismiss();
    }

    confirm () {
        this.loader.save = true;
        this.VpsService.postAdditionalDiskOrder(this.model.capacity, this.model.duration)
            .then(order => {
                this.CloudMessage.success(this.$translate.instant("vps_order_additional_disk_success"));
                window.open(order.url, '_blank');
            })
            .catch(() => this.CloudMessage.error(this.$translate.instant("vps_order_additional_disk_fail")))
            .finally(() => {
                this.loader.save = false;
                this.$uibModalInstance.close();
            });
    }
}

angular.module("managerApp").controller("OrderAdditionalDiskCtrl", OrderAdditionalDiskCtrl);
