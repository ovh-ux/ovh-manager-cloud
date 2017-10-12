class CloudDesktopSidebarService {
    constructor ($translate, OvhApiMe, SidebarMenu, SidebarService, SIDEBAR_MIN_ITEM_FOR_SEARCH, URLS) {
        this.$translate = $translate;
        this.SidebarMenu = SidebarMenu;
        this.SidebarService = SidebarService;
        this.SIDEBAR_MIN_ITEM_FOR_SEARCH = SIDEBAR_MIN_ITEM_FOR_SEARCH;
        this.URLS = URLS;
        this.User = OvhApiMe;

        this.section = [{
            provider: this,
            type: "CLOUD_DESKTOP"
        }];

        this.locale = null;
        this.User.Lexi().get().$promise
            .then(user => {
                this.locale = user.ovhSubsidiary;
            });
    }

    fillSection (services) {
        const deskaasMenuSection = this.SidebarMenu.addMenuItem({
            id: "mainCloudDesktopItem",
            title: this.$translate.instant("cloud_sidebar_section_cloud_desktop"),
            icon: "ovh-font ovh-font-cloud-desktop",
            loadOnState: "deskaas",
            allowSubItems: true,
            allowSearch: this.SidebarService.getNumberOfServicesPerSection(services) > this.SIDEBAR_MIN_ITEM_FOR_SEARCH
        });
        this.SidebarService.fillSection(deskaasMenuSection, this.section, false, services);
    }

    loadIntoSection (section, services) {
        _.forEach(services, service => {
            const menuItem = this.SidebarMenu.addMenuItem({
                id: service.serviceName,
                title: service.displayName === "noAlias" ? service.serviceName : service.displayName,
                icon: "ovh-font ovh-font-cloud-desktop",
                allowSubItems: false,
                state: "deskaas.details",
                stateParams: {
                    serviceName: service.serviceName
                },
                loadOnState: "deskaas.details",
                loadOnStateParams: {
                    serviceName: service.serviceName
                }
            }, section);
            this.addSearchKeys(menuItem);
        });
    }

    addOrder () {
        return {
            title: this.$translate.instant("cloud_sidebar_actions_menu_clouddesktop"),
            icon: "ovh-font ovh-font-cloud-desktop",
            href: this.URLS.website_order.cloud_desktop[this.locale],
            target: "_blank",
            external: true
        };
    }

    addSearchKeys (menuItem) {
        menuItem.addSearchKey("Cloud Desktop");
        menuItem.addSearchKey("deskaas");
        menuItem.addSearchKey("vdi");
        menuItem.addSearchKey(this.$translate.instant("cloud_sidebar_actions_menu_clouddesktop"));
    }
}

angular.module("managerApp").service("CloudDesktopSidebarService", CloudDesktopSidebarService);
