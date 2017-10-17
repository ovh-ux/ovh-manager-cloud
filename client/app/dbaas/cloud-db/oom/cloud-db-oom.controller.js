class CloudDbOomCtrl {
    constructor ($stateParams, $translate, CloudDbInstanceService, CloudNavigation, ControllerHelper) {
        this.$stateParams = $stateParams;
        this.$translate = $translate;
        this.CloudDbInstanceService = CloudDbInstanceService;
        this.CloudNavigation = CloudNavigation;
        this.ControllerHelper = ControllerHelper;

        this.projectId = this.$stateParams.projectId;
        this.instanceId = this.$stateParams.instanceId;

        this.ooms = this.ControllerHelper.request.getArrayLoader({
            loaderFunction: () => this.CloudDbInstanceService.getOom(this.projectId, this.instanceId)
        });

        this.initActions();
    }

    $onInit () {
        this.ooms.load();
        this.previousState = this.CloudNavigation.getPreviousState();
    }

    initActions () {
        this.actions = {
            changeOffer: {
                text: this.$translate.instant("cloud_db_oom_change_offer"),
                state: "dbaas.cloud-db.instance.detail.offer.update",
                stateParams: { projectId: this.projectId, instanceId: this.instanceId },
                isAvailable: () => true
            }
        };
    }
}

angular.module("managerApp").controller("CloudDbOomCtrl", CloudDbOomCtrl);
