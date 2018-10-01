class LoadBalancerSectionSidebarService {
  constructor($translate, SidebarMenu, SidebarHelper, IplbSidebar, SIDEBAR_MIN_ITEM_FOR_SEARCH) {
    this.$translate = $translate;
    this.SidebarMenu = SidebarMenu;
    this.SidebarHelper = SidebarHelper;
    this.SIDEBAR_MIN_ITEM_FOR_SEARCH = SIDEBAR_MIN_ITEM_FOR_SEARCH;

    this.sectionName = 'iplb';
    this.productTypesInSection = [
      IplbSidebar,
    ];
  }

  createSection(iplbProducts) {
    const iplbMenuSection = this.SidebarMenu.addMenuItem({
      id: 'mainLoadBalancerItem',
      title: this.$translate.instant('cloud_sidebar_section_load_balancer'),
      icon: 'ovh-font ovh-font-iplb',
      loadOnState: 'network.iplb',
      allowSubItems: true,
      allowSearch: this.SidebarHelper.constructor
        .countProductsInSection(iplbProducts) > this.SIDEBAR_MIN_ITEM_FOR_SEARCH,
    });
    this.SidebarHelper.constructor.fillSection(
      iplbMenuSection,
      this.productTypesInSection,
      iplbProducts,
    );
  }
}

angular.module('managerApp').service('LoadBalancerSectionSidebarService', LoadBalancerSectionSidebarService);
