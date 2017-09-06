class IpLoadBalancerDashboardHeaderCtrl {
    constructor ($stateParams, ControllerHelper, IpLoadBalancerHomeService, SidebarMenu) {
        this.$stateParams = $stateParams;
        this.ControllerHelper = ControllerHelper;
        this.IpLoadBalancerHomeService = IpLoadBalancerHomeService;
        this.SidebarMenu = SidebarMenu;

        this.serviceName = $stateParams.serviceName;

        //  No error handling since we don't want to break anything for a title.
        this.configuration = this.configuration = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () => this.IpLoadBalancerHomeService.getConfiguration(this.serviceName),
            successHandler: () => { this.menuItem.title = this.configuration.data.displayName; }
        });
    }

    $onInit () {
        this.menuItem = this.SidebarMenu.getItemById(this.serviceName);

        //  If the menu is not yet loaded, we fetch IPLB's displayName.  Dirty patch.
        if (!this.menuItem) {
            this.menuItem = { title: this.serviceName };
            this.configuration.load();
        }
    }
}

angular.module("managerApp").controller("IpLoadBalancerDashboardHeaderCtrl", IpLoadBalancerDashboardHeaderCtrl);
