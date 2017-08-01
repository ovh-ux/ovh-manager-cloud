class VrackSectionSidebarService {
    constructor ($translate, SidebarMenu, SidebarService, VrackSidebar, SIDEBAR_MIN_ITEM_FOR_SEARCH) {
        this.$translate = $translate;
        this.SidebarMenu = SidebarMenu;
        this.SidebarService = SidebarService;
        this.SIDEBAR_MIN_ITEM_FOR_SEARCH = SIDEBAR_MIN_ITEM_FOR_SEARCH;

        this.section = [
            {
                provider: VrackSidebar,
                type: "VRACK"
            }
        ];
    }

    fillSection (services) {
        // All PaaS (Platform as a Service) main item
        const vrackMenuSection = this.SidebarMenu.addMenuItem({
            d: "mainVrackItem",
            title: this.$translate.instant("cloud_sidebar_section_vrack"),
            icon: "vRack",
            loadOnState: "vrack",
            allowSubItems: true,
            allowSearch: this.SidebarService.getNumberOfServicesPerSection(services) > this.SIDEBAR_MIN_ITEM_FOR_SEARCH
        });
        this.SidebarService.fillSection(vrackMenuSection, this.section, false, services);
    }
}

angular.module("managerApp").service("VrackSectionSidebarService", VrackSectionSidebarService);
