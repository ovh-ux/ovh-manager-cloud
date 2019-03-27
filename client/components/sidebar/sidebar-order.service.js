import disableOrderModalTpl from '../disable-order-modal/template.html';
import disableOrderModalCtrl from '../disable-order-modal/controller';

class SidebarOrderService {
  constructor(atInternet, CucFeatureAvailabilityService, SidebarMenu, CloudProjectSidebar,
    VpsSidebar, DedicatedServerSidebar, DedicatedCloudSidebar, CdaSidebar, NashaSidebar,
    VeeamSidebar, VeeamEnterpriseSidebar, DBaasTsSidebar, VrackSidebar, DeskaasSidebar,
    IpSidebar, IplbSidebar, LicenseSidebar, CloudDBSidebar, LogsSidebar, KubernetesSidebar,
    $uibModal) {
    this.CucFeatureAvailabilityService = CucFeatureAvailabilityService;
    this.SidebarMenu = SidebarMenu;
    this.atInternet = atInternet;

    this.$uibModal = $uibModal;

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

      if (locale === 'US') {
        delete orderItem.state;
        orderItem.href = window.location.href;
        orderItem.target = '_self';
        orderItem.external = false;
        orderItem.onClick = () => {
          this.$uibModal.open({
            template: disableOrderModalTpl,
            controller: disableOrderModalCtrl,
            controllerAs: '$ctrl',
          });
          return true;
        };
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
