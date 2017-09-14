class MetricsSectionSidebarService {
    constructor ($translate, SidebarMenu, SidebarService, DBaasTsSidebar, SIDEBAR_MIN_ITEM_FOR_SEARCH) {
        this.$translate = $translate;
        this.SidebarMenu = SidebarMenu;
        this.SidebarService = SidebarService;
        this.SIDEBAR_MIN_ITEM_FOR_SEARCH = SIDEBAR_MIN_ITEM_FOR_SEARCH

        this.section = [
            {
                provider: DBaasTsSidebar,
                type: "METRICS"
            }
        ];
    }

    fillSection (services) {
        // All PaaS (Platform as a Service) main item
        const metricsMenuSection = this.SidebarMenu.addMenuItem({
            id: "mainMetricsItem",
            title: this.$translate.instant("cloud_sidebar_section_metrics"),
            icon: "ovh-font ovh-font-graph",
            loadOnState: "dbaas",
            allowSubItems: true,
            allowSearch: this.SidebarService.getNumberOfServicesPerSection(services) > this.SIDEBAR_MIN_ITEM_FOR_SEARCH
        });
        this.SidebarService.fillSection(metricsMenuSection, this.section, false, services);
    }
}

angular.module("managerApp").service("MetricsSectionSidebarService", MetricsSectionSidebarService);
