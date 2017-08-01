class VpsSidebar {
    constructor ($translate, User, SidebarMenu, REDIRECT_URLS, URLS) {
        this.$translate = $translate;
        this.User = User;
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
        _.forEach(services, vps => {
            const menuItem = this.SidebarMenu.addMenuItem({
                id: vps.serviceName,
                title: vps.displayName || vps.serviceName,
                icon: "vps",
                target: "_parent",
                url: this.REDIRECT_URLS.vpsPage.replace("{vps}", vps.serviceName)
            }, section);
            this.addSearchKeys(menuItem);
        });
    }

    addSearchKeys (menuItem) {
        menuItem.addSearchKey("VPS");
    }

    addOrder () {
        return {
            title: this.$translate.instant("cloud_sidebar_actions_menu_vps"),
            icon: "server2",
            href: this.URLS.website_order.vps[this.locale],
            target: "_blank",
            external: true
        }
    }
}

angular.module("managerApp").service("VpsSidebar", VpsSidebar);
