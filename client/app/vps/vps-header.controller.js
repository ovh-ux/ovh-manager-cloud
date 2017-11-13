class VpsHeaderCtrl {
    constructor ($rootScope, $stateParams, $translate, CloudMessage, VpsService) {
        this.$rootScope = $rootScope;
        this.$stateParams = $stateParams;
        this.$translate = $translate;
        this.CloudMessage = CloudMessage;
        this.serviceName = $stateParams.serviceName;
        this.VpsService = VpsService;

        this.loaders = {
            init: false
        };
    }

    $onInit () {
        this.loaders.init = true;
        this.$rootScope.$on("changeDescription", (event, data) => {
            this.description = data;
        });
        this.VpsService.getSelected(true)
            .then(vps => {
                this.description = vps.displayName;
                this.isInRescueMode(vps.netbootMode);
            })
            .catch(() => this.CloudMessage.error(this.$translate.instant("vps_dashboard_loading_error")))
            .finally(() => { this.loaders.init = false });
    }

    isInRescueMode(netbootMode) {
        if (netbootMode === "RESCUE"){
            this.CloudMessage.warning(this.$translate.instant("vps_configuration_reboot_rescue_warning_text"));
        }
    }

}

angular.module("managerApp").controller("VpsHeaderCtrl", VpsHeaderCtrl);
