class SidebarOrderService {
  constructor(atInternet, FeatureAvailabilityService, SidebarMenu, CloudProjectSidebar, VpsSidebar,
    DedicatedServerSidebar, DedicatedCloudSidebar, CdaSidebar, NashaSidebar, VeeamSidebar,
    DBaasTsSidebar, VrackSidebar, DeskaasSidebar, IpSidebar, IplbSidebar, LicenseSidebar,
    CloudDBSidebar, LogsSidebar) {
    this.FeatureAvailabilityService = FeatureAvailabilityService;
    this.SidebarMenu = SidebarMenu;
    this.atInternet = atInternet;

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
      CloudDBSidebar,
      LogsSidebar,
    ];
  }

  buildSidebarMenuActions(locale) {
    _.forEach(this.productsToOrder, (product) => {
      if (!this.FeatureAvailabilityService.hasFeature(product.type, 'sidebarOrder', locale)) {
        return;
      }
      const orderItem = product.addOrder(locale);
      if (!orderItem) {
        return;
      }
      this.SidebarMenu.addActionsMenuOption(orderItem);
    });
    this.SidebarMenu.addActionsMenuItemClickHandler((id) => {
      this.atInternet.trackClick({
        name: id,
        type: 'action',
      });
    });
  }
}

angular.module('managerApp').service('SidebarOrderService', SidebarOrderService);
