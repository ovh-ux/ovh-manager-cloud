class IaasSectionSidebarService {
  constructor($translate, SidebarMenu, SidebarHelper, CloudProjectSidebar, VpsSidebar,
    DedicatedServerSidebar, DedicatedCloudSidebar, HousingSidebar, SIDEBAR_MIN_ITEM_FOR_SEARCH) {
    this.$translate = $translate;
    this.SidebarMenu = SidebarMenu;
    this.SidebarHelper = SidebarHelper;
    this.SIDEBAR_MIN_ITEM_FOR_SEARCH = SIDEBAR_MIN_ITEM_FOR_SEARCH;

    this.sectionName = 'iaas';
    this.productTypesInSection = [
      CloudProjectSidebar,
      VpsSidebar,
      DedicatedServerSidebar,
      DedicatedCloudSidebar,
      HousingSidebar,
    ];
  }

  createSection(iaasProducts) {
    const iaasMenuSection = this.SidebarMenu.addMenuItem({
      id: 'mainIaasItem',
      title: this.$translate.instant('cloud_sidebar_section_iaas'),
      icon: 'ovh-font ovh-font-cloud-root',
      loadOnState: 'iaas',
      allowSubItems: true,
      allowSearch: this.SidebarHelper.constructor
        .countProductsInSection(iaasProducts) > this.SIDEBAR_MIN_ITEM_FOR_SEARCH,
    });
    this.SidebarHelper.constructor.fillSection(
      iaasMenuSection,
      this.productTypesInSection,
      iaasProducts,
    );
  }
}

angular.module('managerApp').service('IaasSectionSidebarService', IaasSectionSidebarService);
