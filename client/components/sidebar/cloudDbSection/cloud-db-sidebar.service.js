class CloudDbSidebarService {
    constructor ($translate, SidebarMenu, SidebarService, SIDEBAR_MIN_ITEM_FOR_SEARCH) {
        this.$translate = $translate;
        this.SidebarMenu = SidebarMenu;
        this.SidebarService = SidebarService;
        this.SIDEBAR_MIN_ITEM_FOR_SEARCH = SIDEBAR_MIN_ITEM_FOR_SEARCH;

        this.section = [{
            provider: this,
            type: "CLOUD_DB"
        }];
    }

    fillSection (services) {
        const cloudDbMenuSection = this.SidebarMenu.addMenuItem({
            id: "mainCloudDbItem",
            title: this.$translate.instant("cloud_sidebar_section_cloud_db"),
            icon: "ovh-font ovh-font-vRack",
            loadOnState: "dbaas.cloud-db",
            allowSubItems: true,
            allowSearch: this.SidebarService.getNumberOfServicesPerSection(services) > this.SIDEBAR_MIN_ITEM_FOR_SEARCH
        });
        this.SidebarService.fillSection(cloudDbMenuSection, this.section, false, services);
    }

    loadIntoSection (section, services) {
        _.forEach(services, service => {
            const menuItem = this.SidebarMenu.addMenuItem({
                id: service.serviceName,
                title: service.displayName,
                icon: "ovh-font ovh-font-veeam",
                allowSubItems: false,
                state: "dbaas.cloud-db.project",
                stateParams: {
                    projectId: service.serviceName
                },
                loadOnState: "dbaas.cloud-db.project",
                loadOnStateParams: {
                    projectId: service.serviceName
                }
            }, section);
            this.addSearchKeys(menuItem);
        });
    }

    addSearchKeys (menuItem) {
        menuItem.addSearchKey("CLOUD DB");
        menuItem.addSearchKey("DB");
        menuItem.addSearchKey(this.$translate.instant("cloud_sidebar_section_cloud_db"));
    }
}

angular.module("managerApp").service("CloudDbSidebarService", CloudDbSidebarService);
