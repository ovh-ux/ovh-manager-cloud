class SidebarOrderService {
  constructor(atInternet, AnalyticsSidebar, CucFeatureAvailabilityService, SidebarMenu,
    CloudProjectSidebar, VpsSidebar, DedicatedServerSidebar, DedicatedCloudSidebar, CdaSidebar,
    NashaSidebar, VeeamSidebar, VeeamEnterpriseSidebar, DBaasTsSidebar, VrackSidebar,
    DeskaasSidebar, IpSidebar, IplbSidebar, LicenseSidebar, CloudDBSidebar, LogsSidebar,
    KubernetesSidebar) {
    this.CucFeatureAvailabilityService = CucFeatureAvailabilityService;
    this.SidebarMenu = SidebarMenu;
    this.atInternet = atInternet;

    // In order of appearance in the actions menu
    this.productsToOrder = [
      KubernetesSidebar,
      CloudProjectSidebar,
      VpsSidebar,
      DedicatedServerSidebar,
      DedicatedCloudSidebar,
      CdaSidebar,
      NashaSidebar,
      VeeamSidebar,
      VeeamEnterpriseSidebar,
      DBaasTsSidebar,
      VrackSidebar,
      DeskaasSidebar,
      IpSidebar,
      IplbSidebar,
      LicenseSidebar,
      CloudDBSidebar,
      LogsSidebar,
      AnalyticsSidebar,
    ];
  }

  buildSidebarMenuActions(locale) {
    _.forEach(this.productsToOrder, (product) => {
      if (!this.CucFeatureAvailabilityService.hasFeature(product.type, 'sidebarOrder', locale)) {
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
