class LicenseSectionSidebarService {
    constructor ($translate, SidebarMenu, SidebarService, LicenseSidebar, SIDEBAR_MIN_ITEM_FOR_SEARCH, REDIRECT_URLS) {
        this.$translate = $translate;
        this.SidebarMenu = SidebarMenu;
        this.SidebarService = SidebarService;
        this.SIDEBAR_MIN_ITEM_FOR_SEARCH = SIDEBAR_MIN_ITEM_FOR_SEARCH;
        this.REDIRECT_URLS = REDIRECT_URLS;

        this.sectionName = "license";
        this.productTypesInSection = [
            LicenseSidebar
        ];
    }

    createSection () {
        this.SidebarMenu.addMenuItem({
            id: "mainLicenseItem",
            title: this.$translate.instant("cloud_sidebar_section_license"),
            icon: "ovh-font ovh-font-certificate",
            url: this.REDIRECT_URLS.license,
            target: "_parent"
        });
    }
}

angular.module("managerApp").service("LicenseSectionSidebarService", LicenseSectionSidebarService);
