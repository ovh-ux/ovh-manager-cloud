class CloudDbOfferEditCtrl {
    constructor ($stateParams, CloudNavigation, ControllerHelper) {
        this.$stateParams = $stateParams;
        this.CloudNavigation = CloudNavigation;
        this.ControllerHelper = ControllerHelper;

        this.projectId = this.$stateParams.projectId;
        this.instanceId = this.$stateParams.instanceId;
    }

    $onInit () {
        this.previousState = this.CloudNavigation.getPreviousState();
    }
}

angular.module("managerApp").controller("CloudDbOfferEditCtrl", CloudDbOfferEditCtrl);
