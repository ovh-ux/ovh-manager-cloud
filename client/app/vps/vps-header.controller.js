class VpsHeaderCtrl {
    constructor ($scope, $stateParams, $translate, CloudMessage, VpsService) {
        this.$scope = $scope;
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
        this.VpsService.getSelected(true)
            .then(vps => { this.description = vps.displayName })
            .catch(() => this.CloudMessage.error(this.$translate.instant("vps_dashboard_loading_error")))
            .finally(() => { this.loaders.init = false });
        this.$scope.$on("changeDescription", (event, data) => {
            this.description = data;
        });
    }

}

angular.module("managerApp").controller("VpsHeaderCtrl", VpsHeaderCtrl);
