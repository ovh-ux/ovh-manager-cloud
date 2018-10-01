class MetricsSectionSidebarService {
  constructor($translate, SidebarMenu, SidebarHelper, DBaasTsSidebar, SIDEBAR_MIN_ITEM_FOR_SEARCH) {
    this.$translate = $translate;
    this.SidebarMenu = SidebarMenu;
    this.SidebarHelper = SidebarHelper;
    this.SIDEBAR_MIN_ITEM_FOR_SEARCH = SIDEBAR_MIN_ITEM_FOR_SEARCH;

    this.sectionName = 'metrics';
    this.productTypesInSection = [
      DBaasTsSidebar,
    ];
  }

  createSection(metricsProducts) {
    const metricsMenuSection = this.SidebarMenu.addMenuItem({
      id: 'mainMetricsItem',
      title: this.$translate.instant('cloud_sidebar_section_metrics'),
      icon: 'ovh-font ovh-font-graph',
      loadOnState: 'dbaas.metrics',
      allowSubItems: true,
      allowSearch: this.SidebarHelper.constructor
        .countProductsInSection(metricsProducts) > this.SIDEBAR_MIN_ITEM_FOR_SEARCH,
    });
    this.SidebarHelper.constructor.fillSection(
      metricsMenuSection,
      this.productTypesInSection,
      metricsProducts,
    );
  }
}

angular.module('managerApp').service('MetricsSectionSidebarService', MetricsSectionSidebarService);
