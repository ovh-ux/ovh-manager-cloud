class CloudDbOfferEditCtrl {
    constructor ($stateParams, ControllerHelper) {
        this.$stateParams = $stateParams;
        this.ControllerHelper = ControllerHelper;

        this.projectId = this.$stateParams.projectId;
        this.instanceId = this.$stateParams.instanceId;
    }
}

angular.module("managerApp").controller("CloudDbOfferEditCtrl", CloudDbOfferEditCtrl);
