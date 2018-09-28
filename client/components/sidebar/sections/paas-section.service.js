class PaasSectionSidebarService {
  constructor($translate, SidebarMenu, SidebarHelper, CdaSidebar, NasSidebar, NashaSidebar,
    CdnSidebar, VeeamSidebar, SIDEBAR_MIN_ITEM_FOR_SEARCH) {
    this.$translate = $translate;
    this.SidebarMenu = SidebarMenu;
    this.SidebarHelper = SidebarHelper;
    this.SIDEBAR_MIN_ITEM_FOR_SEARCH = SIDEBAR_MIN_ITEM_FOR_SEARCH;

    this.sectionName = 'paas';
    this.productTypesInSection = [
      CdaSidebar,
      NasSidebar,
      NashaSidebar,
      CdnSidebar,
      VeeamSidebar,
    ];
  }

  createSection(paasProducts) {
    const paasMenuSection = this.SidebarMenu.addMenuItem({
      id: 'mainPaasItem',
      title: this.$translate.instant('cloud_sidebar_section_paas'),
      icon: 'ovh-font ovh-font-cloud-package',
      loadOnState: 'paas',
      allowSubItems: true,
      allowSearch: this.SidebarHelper.constructor
        .countProductsInSection(paasProducts) > this.SIDEBAR_MIN_ITEM_FOR_SEARCH,
    });
    this.SidebarHelper.constructor.fillSection(
      paasMenuSection,
      this.productTypesInSection,
      paasProducts,
    );
  }
}

angular.module('managerApp').service('PaasSectionSidebarService', PaasSectionSidebarService);
