class CloudDbProjectHeaderCtrl {
    constructor ($scope, $stateParams, ControllerHelper, CloudDbProjectService, SidebarMenu) {
        this.$scope = $scope;
        this.$stateParams = $stateParams;
        this.ControllerHelper = ControllerHelper;
        this.CloudDbProjectService = CloudDbProjectService;
        this.SidebarMenu = SidebarMenu;

        this.projectId = $stateParams.projectId;

        //  No error handling since we don't want to break anything for a title.
        this.configuration = this.configuration = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () => this.CloudDbProjectService.getConfiguration(this.projectId),
            successHandler: () => { this.menuItem.title = this.configuration.data.displayName; }
        });

        this.$scope.$on("cloudDb.project.nameChange", () => {
            this.$onInit();
        });
    }

    $onInit () {
        this.menuItem = this.SidebarMenu.getItemById(this.projectId);

        //  If the menu is not yet loaded, we fetch IPLB's displayName.  Dirty patch.
        if (!this.menuItem) {
            this.menuItem = { title: _.get(this.configuration, "data.displayName") || this.projectId };
            this.configuration.load();
        }
    }
}

angular.module("managerApp").controller("CloudDbProjectHeaderCtrl", CloudDbProjectHeaderCtrl);
