class DedicatedCloudSidebar {
    constructor ($translate, OvhApiMe, SidebarMenu, REDIRECT_URLS, URLS) {
        this.$translate = $translate;
        this.User = OvhApiMe;
        this.SidebarMenu = SidebarMenu;
        this.REDIRECT_URLS = REDIRECT_URLS;
        this.URLS = URLS;

        this.locale = null;
        this.User.v6().get().$promise
            .then(user => {
                this.locale = user.ovhSubsidiary;
            });
    }

    loadIntoSection (section, services) {
        _.forEach(services, pcc => {
            const menuItem = this.SidebarMenu.addMenuItem({
                id: pcc.serviceName,
                title: pcc.displayName || pcc.serviceName,
                icon: "ovh-font ovh-font-dedicated-cloud2",
                target: "_parent",
                url: this.REDIRECT_URLS.dedicatedCloudPage.replace("{pcc}", pcc.serviceName)
            }, section);
            this.addSearchKeys(menuItem);
        });
    }

    addSearchKeys (menuItem) {
        menuItem.addSearchKey("PCC");
        menuItem.addSearchKey("DEDICATED CLOUD");
        menuItem.addSearchKey("PRIVATE CLOUD");
        menuItem.addSearchKey(this.$translate.instant("cloud_sidebar_actions_menu_dedicated_cloud"));
    }

    addOrder () {
        return {
            title: this.$translate.instant("cloud_sidebar_actions_menu_dedicated_cloud"),
            icon: "ovh-font ovh-font-dedicatedCloud",
            href: this.URLS.website_order.dedicated_cloud[this.locale],
            target: "_blank",
            external: true
        }
    }
}

angular.module("managerApp").service("DedicatedCloudSidebar", DedicatedCloudSidebar);
