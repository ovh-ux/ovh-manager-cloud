class NashaSidebar {
    constructor ($translate, SidebarMenu) {
        this.$translate = $translate;
        this.SidebarMenu = SidebarMenu;
    }

    loadIntoSection (section, services) {
        _.forEach(services, nasha => {
            const menuItem = this.SidebarMenu.addMenuItem({
                id: nasha.serviceName,
                icon: "cloudnas",
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
            title: this.$translate.instant("cloud_sidebar_actions_menu_NASHA"),
            icon: "cloudnas",
            state: "paas.nasha-add"
        }
    }
}

angular.module("managerApp").service("NashaSidebar", NashaSidebar);
