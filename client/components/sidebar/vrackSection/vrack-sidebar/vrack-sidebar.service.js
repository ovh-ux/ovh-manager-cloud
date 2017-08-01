class VrackSidebar {
    constructor ($translate, SidebarMenu) {
        this.$translate = $translate;
        this.SidebarMenu = SidebarMenu;
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
        return {
            title: this.$translate.instant("cloud_sidebar_actions_menu_vrack"),
            icon: "vRack",
            state: "vrack-add"
        }
    }
}

angular.module("managerApp").service("VrackSidebar", VrackSidebar);
