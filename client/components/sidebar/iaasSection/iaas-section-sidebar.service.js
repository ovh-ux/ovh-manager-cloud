class IaasSectionSidebarService {
    constructor ($translate, SidebarMenu, SidebarService, CloudProjectSidebar, VpsSidebar, DedicatedServerSidebar,
                 DedicatedCloudSidebar, HousingSidebar, SIDEBAR_MIN_ITEM_FOR_SEARCH) {
        this.$translate = $translate;
        this.SidebarMenu = SidebarMenu;
        this.SidebarService = SidebarService;
        this.SIDEBAR_MIN_ITEM_FOR_SEARCH = SIDEBAR_MIN_ITEM_FOR_SEARCH;

        this.section = [
            {
                //Show Cloud Project first
                provider: CloudProjectSidebar,
                type: "PROJECT"
            }, {
                provider: VpsSidebar,
                type: "VPS"
            }, {
                provider: DedicatedServerSidebar,
                type: "SERVER"
            }, {
                provider: DedicatedCloudSidebar,
                type: "DEDICATED_CLOUD"
            }, {
                provider: HousingSidebar,
                type: "HOUSING"
            }
        ];
    }

    fillSection (services) {
        const iaasMenuSection = this.SidebarMenu.addMenuItem({
            id: "mainIaasItem",
            title: this.$translate.instant("cloud_sidebar_section_iaas"),
            icon: "ovh-font ovh-font-cloud-root",
            loadOnState: "iaas",
            allowSubItems: true,
            allowSearch: this.SidebarService.getNumberOfServicesPerSection(services) > this.SIDEBAR_MIN_ITEM_FOR_SEARCH
        });
        this.SidebarService.fillSection(iaasMenuSection, this.section, false, services);
    }
}

angular.module("managerApp").service("IaasSectionSidebarService", IaasSectionSidebarService);
