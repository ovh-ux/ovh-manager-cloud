class LogsSectionSidebarService {
    constructor ($translate, SidebarMenu, SidebarService, LogsSidebar, SIDEBAR_MIN_ITEM_FOR_SEARCH) {
        this.$translate = $translate;
        this.SidebarMenu = SidebarMenu;
        this.SidebarService = SidebarService;
        this.SIDEBAR_MIN_ITEM_FOR_SEARCH = SIDEBAR_MIN_ITEM_FOR_SEARCH;

        this.section = [
            {
                provider: LogsSidebar,
                type: "DBAAS_LOGS"
            }
        ];
    }

    fillSection (services) {
        const logsMenuSection = this.SidebarMenu.addMenuItem({
            id: "mainLogsItem",
            title: this.$translate.instant("cloud_sidebar_section_logs"),
            allowSubItems: true,
            icon: "fa fa-bar-chart", // "ovh-font ovh-font-logs",
            allowSearch: this.SidebarService.getNumberOfServicesPerSection(services) > this.SIDEBAR_MIN_ITEM_FOR_SEARCH
        });
        this.SidebarService.fillSection(logsMenuSection, this.section, false, services);
    }
}

angular.module("managerApp").service("LogsSectionSidebarService", LogsSectionSidebarService);
