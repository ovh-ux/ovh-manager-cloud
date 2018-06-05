class LogsSectionSidebarService {
    constructor ($translate, SidebarMenu, SidebarService, LogsSidebar, SIDEBAR_MIN_ITEM_FOR_SEARCH) {
        this.$translate = $translate;
        this.SidebarMenu = SidebarMenu;
        this.SidebarService = SidebarService;
        this.SIDEBAR_MIN_ITEM_FOR_SEARCH = SIDEBAR_MIN_ITEM_FOR_SEARCH;

        this.sectionName = "logs";
        this.productTypesInSection = [
            LogsSidebar
        ];
    }

    createSection (logsProducts) {
        const logsMenuSection = this.SidebarMenu.addMenuItem({
            id: "mainLogsItem",
            title: this.$translate.instant("cloud_sidebar_section_logs"),
            allowSubItems: true,
            icon: "fa fa-bar-chart", // "ovh-font ovh-font-logs",
            loadOnState: "dbaas.logs",
            allowSearch: this.SidebarService.countProductsInSection(logsProducts) > this.SIDEBAR_MIN_ITEM_FOR_SEARCH
        });
        this.SidebarService.fillSection(logsMenuSection, this.productTypesInSection, logsProducts);
    }
}

angular.module("managerApp").service("LogsSectionSidebarService", LogsSectionSidebarService);
