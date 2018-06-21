class NashaSidebar {
    constructor ($translate, SidebarMenu) {
        this.$translate = $translate;
        this.SidebarMenu = SidebarMenu;

        this.type = "NASHA";
    }

    loadIntoSection (section, services) {
        _.forEach(services, nasha => {
            const menuItem = this.SidebarMenu.addMenuItem({
                id: nasha.serviceName,
                icon: "ovh-font ovh-font-cloudnas",
                title: nasha.displayName || nasha.serviceName,
                allowSubItems: false,
                state: "paas.nasha.nasha-partitions",
                stateParams: {
                    nashaId: nasha.serviceName
                },
                loadOnState: "paas.nasha.nasha-partitions",
                loadOnStateParams: {
                    nashaId: nasha.serviceName
                }
            }, section);
            this.addSearchKeys(menuItem);
        });
    }

    addSearchKeys (menuItem) {
        menuItem.addSearchKey("NAS");
        menuItem.addSearchKey("NASHA");
        menuItem.addSearchKey("NAS-HA");
        menuItem.addSearchKey(this.$translate.instant("cloud_sidebar_actions_menu_NASHA"));
    }

    addOrder () {
        return {
            id: "order-nasha",
            title: this.$translate.instant("cloud_sidebar_actions_menu_NASHA"),
            icon: "ovh-font ovh-font-cloudnas",
            state: "paas.nasha-add"
        };
    }
}

angular.module("managerApp").service("NashaSidebar", NashaSidebar);
