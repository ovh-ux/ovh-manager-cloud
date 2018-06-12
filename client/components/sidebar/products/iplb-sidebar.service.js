class IplbSidebar {
    constructor ($translate, SidebarMenu, OvhApiMe, REDIRECT_URLS, URLS) {
        this.$translate = $translate;
        this.SidebarMenu = SidebarMenu;
        this.User = OvhApiMe;
        this.REDIRECT_URLS = REDIRECT_URLS;
        this.URLS = URLS;

        this.locale = null;
        this.type = "LOAD_BALANCER";

        this.User.v6().get().$promise
            .then(user => {
                this.locale = user.ovhSubsidiary;
            });
    }


    loadIntoSection (section, services) {
        _.forEach(services, service => {
            const menuItem = this.SidebarMenu.addMenuItem({
                id: service.serviceName,
                title: service.displayName,
                icon: "ovh-font ovh-font-iplb",
                allowSubItems: false,
                state: "network.iplb.detail.home",
                stateParams: {
                    serviceName: service.serviceName
                },
                loadOnState: "network.iplb.detail",
                loadOnStateParams: {
                    serviceName: service.serviceName
                }
            }, section);
            this.addSearchKeys(menuItem);
        });
    }

    addSearchKeys (menuItem) {
        menuItem.addSearchKey("IP Load Balancer");
        menuItem.addSearchKey("IPLB");
        menuItem.addSearchKey(this.$translate.instant("cloud_sidebar_actions_menu_iplb"));
    }

    addOrder () {
        return {
            id: "order-loadbalancer",
            title: this.$translate.instant("cloud_sidebar_actions_menu_iplb"),
            icon: "ovh-font ovh-font-ip",
            href: this.URLS.website_order.load_balancer[this.locale],
            target: "_blank",
            external: true
        };
    }
}

angular.module("managerApp").service("IplbSidebar", IplbSidebar);
