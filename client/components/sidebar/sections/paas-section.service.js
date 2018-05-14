class PaasSectionSidebarService {
    constructor ($translate, SidebarMenu, SidebarService, CdaSidebar, NasSidebar, NashaSidebar,
                 CdnSidebar, VeeamSidebar, SIDEBAR_MIN_ITEM_FOR_SEARCH) {
        this.$translate = $translate;
        this.SidebarMenu = SidebarMenu;
        this.SidebarService = SidebarService;
        this.SIDEBAR_MIN_ITEM_FOR_SEARCH = SIDEBAR_MIN_ITEM_FOR_SEARCH;

        this.sectionName = "paas";
        this.productTypesInSection = [
            CdaSidebar,
            NasSidebar,
            NashaSidebar,
            CdnSidebar,
            VeeamSidebar
        ];
    }

    createSection (paasProducts) {
        const paasMenuSection = this.SidebarMenu.addMenuItem({
            id: "mainPaasItem",
            title: this.$translate.instant("cloud_sidebar_section_paas"),
            icon: "ovh-font ovh-font-cloud-package",
            loadOnState: "paas",
            allowSubItems: true,
            allowSearch: this.SidebarService.countProductsInSection(paasProducts) > this.SIDEBAR_MIN_ITEM_FOR_SEARCH
        });
        this.SidebarService.fillSection(paasMenuSection, this.productTypesInSection, paasProducts);
    }
}

angular.module("managerApp").service("PaasSectionSidebarService", PaasSectionSidebarService);
