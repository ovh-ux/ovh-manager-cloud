class VrackSidebar {
    constructor ($translate, SidebarMenu, URLS, User) {
        this.$translate = $translate;
        this.SidebarMenu = SidebarMenu;
        this.URLS = URLS;
        this.User = User;

        this.locale = null;
        this.User.Lexi().get().$promise
            .then(user => {
                this.locale = user.ovhSubsidiary;
            });
    }

    loadIntoSection (section, services) {
        const orderedServices = _.sortBy(services, ["displayName"]);
        _.forEach(orderedServices, vrack => {
            this.SidebarMenu.addMenuItem({
                id: vrack.serviceName,
                title: vrack.displayName,
                allowSubItems: false,
                state: "vrack",
                stateParams: {
                    vrackId: vrack.serviceName
                },
                loadOnState: "vrack",
                loadOnStateParams: {
                    vrackId: vrack.serviceName
                }
            }, section);
        });
    }

    addOrder () {
        const link = _.get(this.URLS.website_order, `vrack.${this.locale}`);
        if (!link) {
            return null;
        }

        return {
            title: this.$translate.instant("cloud_sidebar_actions_menu_vrack"),
            icon: "vRack",
            href: link,
            target: "_blank",
            external: true
        };
    }
}

angular.module("managerApp").service("VrackSidebar", VrackSidebar);
