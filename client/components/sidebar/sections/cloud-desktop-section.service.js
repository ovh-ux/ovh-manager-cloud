class CloudDesktopSectionSidebarService {
    constructor ($translate, SidebarMenu, SidebarService, DeskaasSidebar, SIDEBAR_MIN_ITEM_FOR_SEARCH, URLS) {
        this.$translate = $translate;
        this.SidebarMenu = SidebarMenu;
        this.SidebarService = SidebarService;
        this.SIDEBAR_MIN_ITEM_FOR_SEARCH = SIDEBAR_MIN_ITEM_FOR_SEARCH;
        this.URLS = URLS;

        this.sectionName = "deskaas";
        this.productTypesInSection = [
            DeskaasSidebar
        ];
    }

    createSection (deskaasProducts) {
        const deskaasMenuSection = this.SidebarMenu.addMenuItem({
            id: "mainCloudDesktopItem",
            title: this.$translate.instant("cloud_sidebar_section_cloud_desktop"),
            icon: "ovh-font ovh-font-cloud-desktop",
            loadOnState: "deskaas",
            allowSubItems: true,
            allowSearch: this.SidebarService.countProductsInSection(deskaasProducts) > this.SIDEBAR_MIN_ITEM_FOR_SEARCH
        });
        this.SidebarService.fillSection(deskaasMenuSection, this.productTypesInSection, deskaasProducts);
    }
}

angular.module("managerApp").service("CloudDesktopSectionSidebarService", CloudDesktopSectionSidebarService);
