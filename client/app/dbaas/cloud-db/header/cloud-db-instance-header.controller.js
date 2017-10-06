class CloudDbInstanceHeaderCtrl {
    constructor ($scope, $stateParams, ControllerHelper, CloudDbHomeService, SidebarMenu) {
        this.$scope = $scope;
        this.$stateParams = $stateParams;
        this.ControllerHelper = ControllerHelper;
        this.CloudDbHomeService = CloudDbHomeService;
        this.SidebarMenu = SidebarMenu;

        this.projectId = $stateParams.projectId;
        this.instanceId = $stateParams.instanceId;

        this.displayName = this.instanceId;
        //  No error handling since we don't want to break anything for a title.
        this.configuration = this.configuration = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () => this.CloudDbHomeService.getConfiguration(this.projectId, this.instanceId),
            successHandler: () => { this.displayName = this.configuration.data.displayName; }
        });

        this.$scope.$on("cloudDb.instance.nameChange", () => {
            this.$onInit();
        });
    }

    $onInit () {
        this.configuration.load();
    }
}

angular.module("managerApp").controller("CloudDbInstanceHeaderCtrl", CloudDbInstanceHeaderCtrl);
