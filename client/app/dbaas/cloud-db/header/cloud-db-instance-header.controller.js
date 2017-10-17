class CloudDbInstanceHeaderCtrl {
    constructor ($scope, $stateParams, ControllerHelper, CloudDbInstanceService, SidebarMenu, CloudNavigation) {
        this.$scope = $scope;
        this.$stateParams = $stateParams;
        this.ControllerHelper = ControllerHelper;
        this.CloudDbInstanceService = CloudDbInstanceService;
        this.SidebarMenu = SidebarMenu;
        this.CloudNavigation = CloudNavigation;

        this.projectId = $stateParams.projectId;
        this.instanceId = $stateParams.instanceId;

        this.displayName = this.instanceId;
        //  No error handling since we don't want to break anything for a title.
        this.instance = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () => this.CloudDbInstanceService.getInstance(this.projectId, this.instanceId),
            successHandler: () => {
                this.displayName = this.instance.data.displayName;

                const capabilities = this.instance.data.image.capabilities;
                this.showDatabaseTab = capabilities.database.creation || capabilities.database.delete || capabilities.database.update;
                this.showUserTab = capabilities.user.creation || capabilities.user.delete || capabilities.user.update;
                this.showBackupTab = capabilities.dump.creation || capabilities.dump.delete || capabilities.dump.update;
            }
        });

        this.$scope.$on("cloudDb.instance.nameChange", () => {
            this.$onInit();
        });
    }

    $onInit () {
        this.instance.load();
    }
}

angular.module("managerApp").controller("CloudDbInstanceHeaderCtrl", CloudDbInstanceHeaderCtrl);
