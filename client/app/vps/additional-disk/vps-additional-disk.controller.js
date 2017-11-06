class VpsAdditionalDiskCtrl {
    constructor ($q, $translate, CloudMessage, VpsActionService ,VpsService) {
        this.$q = $q;
        this.$translate = $translate;
        this.CloudMessage = CloudMessage;
        this.VpsActionService = VpsActionService;
        this.VpsService = VpsService;

        this.loaders = {
            init: false,
            disk: false
        };
        this.additionnalDisks = [];
        this.hasAdditionalDiskOption = null;

    }

    $onInit () {
        this.hasAdditionalDisk();
    }

    hasAdditionalDisk () {
        this.loaders.init = true;
        this.VpsService.hasAdditionalDiskOption()
            .then(() => { this.hasAdditionalDiskOption = true })
            .catch(() => {
                this.CloudMessage.error(this.$translate.instant("vps_additional_disk_info_fail"));
                this.hasAdditionalDiskOption = false;
            })
            .finally(() => { 
                this.loaders.init = false;
                if (this.hasAdditionalDiskOption) {
                    this.loadAdditionalDisks();
                }
            });
    }

    loadAdditionalDisks () {
        this.loaders.disk = true;
        this.VpsService.getDisks()
            .then(data => {
                const promises = _.map(data, elem => { return this.VpsService.getDiskInfo(elem) });
                return this.$q.all(promises)
                    .then(data => { this.additionnalDisks = this.VpsService.showOnlyAdditionalDisk(data) });
            })
            .catch(error => {
                this.CloudMessage.error(this.$translate.instant("vps_additional_disk_info_fail"));
                return this.$q.reject(error);
            })
            .finally(() => { this.loaders.disk = false });
    }

    order () {
        this.VpsActionService.orderAdditionalDisk();
    }

}

angular.module("managerApp").controller("VpsAdditionalDiskCtrl", VpsAdditionalDiskCtrl);
