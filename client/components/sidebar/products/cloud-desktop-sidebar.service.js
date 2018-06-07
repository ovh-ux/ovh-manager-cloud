class DeskaasSidebar {
    constructor ($translate, SidebarMenu, OvhApiMe, URLS) {
        this.$translate = $translate;
        this.SidebarMenu = SidebarMenu;
        this.User = OvhApiMe;
        this.URLS = URLS;

        this.locale = null;
        this.type = "CLOUD_DESKTOP";

        this.User.v6().get().$promise
            .then(user => {
                this.locale = user.ovhSubsidiary;
            });
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

angular.module("managerApp").service("DeskaasSidebar", DeskaasSidebar);
