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

  createSection(logsProducts) {
    const analyticsMenuSection = this.SidebarMenu.addMenuItem({
      id: 'mainAnalyticsItem',
      title: this.$translate.instant('cloud_sidebar_section_analytics'),
      allowSubItems: true,
      state: 'adp.list',
      loadOnState: 'adp.list',
      icon: 'ovh-font ovh-font-adp',
      allowSearch: this.SidebarHelper.constructor
        .countProductsInSection(logsProducts) > this.SIDEBAR_MIN_ITEM_FOR_SEARCH,
    });
    this.SidebarHelper.constructor.fillSection(
      analyticsMenuSection,
      this.productTypesInSection,
      logsProducts,
    );
  }
}

angular.module('managerApp').service('AnalyticsSectionSidebarService', AnalyticsSectionSidebarService);
