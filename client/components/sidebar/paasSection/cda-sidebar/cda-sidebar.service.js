class CdaSidebar {
    constructor ($translate, OvhApiMe, SidebarMenu, URLS) {
        this.$translate = $translate;
        this.User = OvhApiMe;
        this.SidebarMenu = SidebarMenu;
        this.URLS = URLS;

        this.locale = null;
        this.User.Lexi().get().$promise
            .then(user => {
                this.locale = user.ovhSubsidiary;
            });
    }

    loadIntoSection (section, services) {
        _.forEach(services, service => {
            const menuItem = this.SidebarMenu.addMenuItem({
                id: service.serviceName,
                title: service.displayName || service.serviceName,
                icon: "ovh-font ovh-font-cloud-disk-array",
                allowSubItems: false,
                state: "paas.cda.cda-details.cda-details-home",
                stateParams: {
                    serviceName: service.serviceName
                },
                loadOnState: "paas.cda.cda-details",
                loadOnStateParams: {
                    serviceName: service.serviceName
                }
            }, section);
            this.addSearchKeys(menuItem);
        });
    }

    addSearchKeys (menuItem) {
        menuItem.addSearchKey("Cloud Disk Array");
        menuItem.addSearchKey("CDA");
        menuItem.addSearchKey(this.$translate.instant("cloud_sidebar_actions_menu_paas_cda"));
    }

    addOrder () {
        return {
            title: this.$translate.instant("cloud_sidebar_actions_menu_paas_cda"),
            icon: "ovh-font ovh-font-cloud-disk-array",
            href: this.URLS.website_order.cloud_disk_array[this.locale],
            target: "_blank",
            external: true
        }
    }
}

angular.module("managerApp").service("CdaSidebar", CdaSidebar);
