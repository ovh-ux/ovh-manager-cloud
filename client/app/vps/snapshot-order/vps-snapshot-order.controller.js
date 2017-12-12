class VpsOrderSnapshotCtrl {
    constructor ($stateParams, $translate, $window, CloudMessage, CloudNavigation, VpsService) {
        this.$translate = $translate;
        this.serviceName = $stateParams.serviceName;
        this.$window = $window;
        this.CloudMessage = CloudMessage;
        this.CloudNavigation = CloudNavigation;
        this.VpsService = VpsService;

        this.loaders = {
            init: false,
            options: false
        };

        this.model = {
            vps: null,
            optionDetails: null,
            url: null,
            contractsValidated: null
        };
    }

    $onInit () {
        this.previousState = this.CloudNavigation.getPreviousState();
    }

    loadVps () {
        this.loaders.init = true;
        this.VpsService.getSelectedVps(this.serviceName)
            .then(data => {
                this.model.vps = data;
                this.loadOptionDetails(data);
            })
            .catch(error => this.CloudMessage.error(error.message || this.$translate.instant("vps_configuration_activate_snapshot_fail")))
            .finally(() => {this.loaders.init = false;})
    }

    loadOptionDetails (vps) {
        this.loaders.options = true;
        this.VpsService.getOptionSnapshotFormated(vps)
            .then(data => {this.model.optionDetails = data})
            .catch(error => this.CloudMessage.error(error.message || this.$translate.instant("vps_configuration_activate_snapshot_fail")))
            .finally(() => {this.loaders.options = false})
    }

    orderOption () {
        if (this.model.optionDetails && this.model.contractsValidated) {
            this.VpsService.orderOption(this.serviceName, "snapshot", this.model.optionDetails.duration.duration)
                .then(order => {this.model.url = order.url;})
                .catch(error => this.CloudMessage.error(this.$translate.instant("vps_configuration_veeam_order_fail")));
        } else if (this.model.contractsValidated) {
            this.CloudMessage.error(this.$translate.instant("vps_configuration_veeam_order_fail"));
        }
    }

    cancel () {
        this.previousState.go();
    }

    confirm () {
        this.displayBC();
        this.previousState.go();
    }

    displayBC () {
        this.$window.open(
            this.model.url,
            "_blank"
        );
    }
}

angular.module("managerApp").controller("VpsOrderSnapshotCtrl", VpsOrderSnapshotCtrl);
