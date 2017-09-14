class DedicatedServerSidebar {
    constructor ($translate, OvhApiMe, SidebarMenu, REDIRECT_URLS, URLS) {
        this.$translate = $translate;
        this.User = OvhApiMe;
        this.SidebarMenu = SidebarMenu;
        this.REDIRECT_URLS = REDIRECT_URLS;
        this.URLS = URLS;

        this.locale = null;
        this.User.Lexi().get().$promise
            .then(user => {
                this.locale = user.ovhSubsidiary;
            });
    }

    loadIntoSection (section, services) {
        _.forEach(services, server => {
            const menuItem = this.SidebarMenu.addMenuItem({
                id: server.serviceName,
                title: server.displayName || server.serviceName,
                icon: "ovh-font ovh-font-server4",
                target: "_parent",
                url: this.REDIRECT_URLS.dedicatedServersPage.replace("{server}", server.serviceName)
            }, section);
            this.addSearchKeys(menuItem);
        });
    }

    addSearchKeys (menuItem) {
        menuItem.addSearchKey("SERVER");
        menuItem.addSearchKey(this.$translate.instant("cloud_sidebar_actions_menu_dedicated_server"));
    }

    addOrder () {
        return {
            title: this.$translate.instant("cloud_sidebar_actions_menu_dedicated_server"),
            icon: "ovh-font ovh-font-server",
            href: this.URLS.website_order.dedicated_server[this.locale],
            target: "_blank",
            external: true
        }
    }
}

angular.module("managerApp").service("DedicatedServerSidebar", DedicatedServerSidebar);
