class PaasSectionSidebarService {
    constructor ($translate, SidebarMenu, SidebarService, CdaSidebar, NasSidebar, NashaSidebar,
                 CdnSidebar, VeeamSidebar, SIDEBAR_MIN_ITEM_FOR_SEARCH) {
        this.$translate = $translate;
        this.SidebarMenu = SidebarMenu;
        this.SidebarService = SidebarService;
        this.SIDEBAR_MIN_ITEM_FOR_SEARCH = SIDEBAR_MIN_ITEM_FOR_SEARCH;

        this.section = [
            {
                provider: CdaSidebar,
                type: "CEPH"
            }, {
                provider: NasSidebar,
                type: "NAS"
            }, {
                provider: NashaSidebar,
                type: "NASHA"
            }, {
                provider: CdnSidebar,
                type: "CDN"
            }, {
                provider: VeeamSidebar,
                type: "VEEAM"
            }
        ];
    }

    fillSection (services) {
        // All PaaS (Platform as a Service) main item
        const paasMenuSection = this.SidebarMenu.addMenuItem({
            id: "mainPaasItem",
            title: this.$translate.instant("cloud_sidebar_section_paas"),
            icon: "ovh-font ovh-font-cloud-package",
            loadOnState: "paas",
            allowSubItems: true,
            allowSearch: this.SidebarService.getNumberOfServicesPerSection(services) > this.SIDEBAR_MIN_ITEM_FOR_SEARCH
        });
        this.SidebarService.fillSection(paasMenuSection, this.section, false, services);
    }
}

angular.module("managerApp").service("PaasSectionSidebarService", PaasSectionSidebarService);
