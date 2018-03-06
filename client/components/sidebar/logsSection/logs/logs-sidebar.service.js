class LogsSidebar {
    constructor (SidebarMenu, URLS, OvhApiMe) {
        this.SidebarMenu = SidebarMenu;
        this.URLS = URLS;
        this.User = OvhApiMe;

        this.locale = null;
        this.User.Lexi().get().$promise
            .then(user => {
                this.locale = user.ovhSubsidiary;
            });
    }

    loadIntoSection (section, services) {
        const orderedServices = _.sortBy(services, ["displayName"]);
        _.forEach(orderedServices, logService => {
            this.SidebarMenu.addMenuItem({
                id: logService.serviceName,
                title: logService.displayName,
                allowSubItems: false,
                state: "dbaas.logs.detail",
                stateParams: {
                    serviceName: logService.serviceName
                },
                loadOnState: "dbaas.logs.detail",
                loadOnStateParams: {
                    serviceName: logService.serviceName
                }
            }, section);
        });
    }

    addOrder () {
        return null;
    }
}

angular.module("managerApp").service("LogsSidebar", LogsSidebar);
