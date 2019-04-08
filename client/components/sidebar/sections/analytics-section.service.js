class AnalyticsSectionSidebarService {
  constructor($translate, AnalyticsSidebar, SidebarMenu,
    SidebarHelper, SIDEBAR_MIN_ITEM_FOR_SEARCH) {
    this.$translate = $translate;
    this.SidebarMenu = SidebarMenu;
    this.SidebarHelper = SidebarHelper;
    this.SIDEBAR_MIN_ITEM_FOR_SEARCH = SIDEBAR_MIN_ITEM_FOR_SEARCH;

    this.sectionName = 'analytics';
    this.productTypesInSection = [
      AnalyticsSidebar,
    ];
  }

  createSection() {
    this.SidebarMenu.addMenuItem({
      id: 'mainAnalyticsItem',
      title: this.$translate.instant('cloud_sidebar_section_analytics'),
      allowSubItems: false,
      state: 'adp.list',
      loadOnState: 'adp.list',
      icon: 'ovh-font ovh-font-adp',
    });
  }
}

angular.module('managerApp').service('AnalyticsSectionSidebarService', AnalyticsSectionSidebarService);
