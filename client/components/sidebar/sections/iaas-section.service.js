class IaasSectionSidebarService {
    constructor ($translate, SidebarMenu, SidebarService, CloudProjectSidebar, VpsSidebar, DedicatedServerSidebar,
                 DedicatedCloudSidebar, HousingSidebar, SIDEBAR_MIN_ITEM_FOR_SEARCH) {
        this.$translate = $translate;
        this.SidebarMenu = SidebarMenu;
        this.SidebarService = SidebarService;
        this.SIDEBAR_MIN_ITEM_FOR_SEARCH = SIDEBAR_MIN_ITEM_FOR_SEARCH;

        this.sectionName = "iaas";
        this.productTypesInSection = [
            CloudProjectSidebar,
            VpsSidebar,
            DedicatedServerSidebar,
            DedicatedCloudSidebar,
            HousingSidebar
        ];
    }

    createSection (iaasProducts) {
        const iaasMenuSection = this.SidebarMenu.addMenuItem({
            id: "mainIaasItem",
            title: this.$translate.instant("cloud_sidebar_section_iaas"),
            icon: "ovh-font ovh-font-cloud-root",
            loadOnState: "iaas",
            allowSubItems: true,
            allowSearch: this.SidebarService.countProductsInSection(iaasProducts) > this.SIDEBAR_MIN_ITEM_FOR_SEARCH
        });
        this.SidebarService.fillSection(iaasMenuSection, this.productTypesInSection, iaasProducts);
    }
}

angular.module("managerApp").service("IaasSectionSidebarService", IaasSectionSidebarService);
