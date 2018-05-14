class IpSectionSidebarService {
    constructor ($translate, SidebarMenu, SidebarService, IpSidebar, SIDEBAR_MIN_ITEM_FOR_SEARCH, REDIRECT_URLS) {
        this.$translate = $translate;
        this.SidebarMenu = SidebarMenu;
        this.SidebarService = SidebarService;
        this.SIDEBAR_MIN_ITEM_FOR_SEARCH = SIDEBAR_MIN_ITEM_FOR_SEARCH;
        this.REDIRECT_URLS = REDIRECT_URLS;

        this.sectionName = "ip";
        this.productTypesInSection = [
            IpSidebar
        ];
    }

    createSection () {
        this.SidebarMenu.addMenuItem({
            id: "mainIPItem",
            title: this.$translate.instant("cloud_sidebar_section_ip"),
            icon: "ovh-font ovh-font-ip",
            url: this.REDIRECT_URLS.ip,
            target: "_parent"
        });
    }
}

angular.module("managerApp").service("IpSectionSidebarService", IpSectionSidebarService);
