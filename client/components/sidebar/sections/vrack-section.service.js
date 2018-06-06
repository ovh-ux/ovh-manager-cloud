class VrackSectionSidebarService {
    constructor ($q, $translate, SidebarMenu, SidebarHelper, VrackSidebar, SIDEBAR_MIN_ITEM_FOR_SEARCH) {
        this.$translate = $translate;
        this.SidebarMenu = SidebarMenu;
        this.SidebarHelper = SidebarHelper;
        this.SIDEBAR_MIN_ITEM_FOR_SEARCH = SIDEBAR_MIN_ITEM_FOR_SEARCH;

        this.sectionName = "vrack";
        this.productTypesInSection = [
            VrackSidebar
        ];
        // vRacks defer object
        this.vRacks = $q.defer();
    }

    /**
     * returns promise that will be resolved to list of vRacks of current user
     *
     * @returns promise that will be resolved to an array of vRack services available for current logged in user
     * @memberof VrackSectionSidebarService
     */
    getVracks () {
        return this.vRacks.promise;
    }

    createSection (vrackProducts) {
        if (vrackProducts && _.isArray(vrackProducts)) {
            // save vRacks belonging to logged in user to be used later
            this.vRacks.resolve(vrackProducts[0]);
        }
        // All PaaS (Platform as a Service) main item
        const vrackMenuSection = this.SidebarMenu.addMenuItem({
            d: "mainVrackItem",
            title: this.$translate.instant("cloud_sidebar_section_vrack"),
            icon: "ovh-font ovh-font-vRack",
            loadOnState: "vrack",
            allowSubItems: true,
            allowSearch: this.SidebarHelper.countProductsInSection(vrackProducts) > this.SIDEBAR_MIN_ITEM_FOR_SEARCH
        });
        this.SidebarHelper.fillSection(vrackMenuSection, this.productTypesInSection, vrackProducts);
    }
}

angular.module("managerApp").service("VrackSectionSidebarService", VrackSectionSidebarService);
