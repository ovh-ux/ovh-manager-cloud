class SidebarOrderService {
    constructor (FeatureAvailabilityService, SidebarMenu, CloudProjectSidebar, VpsSidebar,
                 DedicatedServerSidebar, DedicatedCloudSidebar, CdaSidebar, NashaSidebar, VeeamSidebar, DBaasTsSidebar,
                 VrackSidebar, DeskaasSidebar, IpSidebar, IplbSidebar, LicenseSidebar, CloudDBSidebar) {
        this.FeatureAvailabilityService = FeatureAvailabilityService;
        this.SidebarMenu = SidebarMenu;

        // In order of appearance in the actions menu
        this.productsToOrder = [
            CloudProjectSidebar,
            VpsSidebar,
            DedicatedServerSidebar,
            DedicatedCloudSidebar,
            CdaSidebar,
            NashaSidebar,
            VeeamSidebar,
            DBaasTsSidebar,
            VrackSidebar,
            DeskaasSidebar,
            IpSidebar,
            IplbSidebar,
            LicenseSidebar,
            CloudDBSidebar
        ];
    }

    fillSidebarMenuActions (locale) {
        _.forEach(this.productsToOrder, product => {
            if (!this.FeatureAvailabilityService.hasFeature(product.type, "sidebarOrder", locale)) {
                return;
            }
            const orderItem = product.addOrder();
            if (!orderItem) {
                return;
            }
            this.SidebarMenu.addActionsMenuOption(orderItem);
        });
    }
}

angular.module("managerApp").service("SidebarOrderService", SidebarOrderService);
