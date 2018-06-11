class LogsSidebar {
    constructor ($translate, SidebarMenu, URLS, OvhApiMe) {
        this.$translate = $translate;
        this.SidebarMenu = SidebarMenu;
        this.URLS = URLS;
        this.User = OvhApiMe;

        this.locale = null;
        this.type = "DBAAS_LOGS";

        this.User.v6().get().$promise
            .then(user => {
                this.locale = user.ovhSubsidiary;
            });
    }

    loadIntoSection (section, services) {
        // add all services navigation link
        this.SidebarMenu.addMenuItem({
            id: "logs-all-accounts",
            title: this.$translate.instant("cloud_sidebar_section_logs_all_accounts"),
            allowSubItems: false,
            state: "dbaas.logs"
        }, section);
        // add navigation link for each account
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
        return {
            title: this.$translate.instant("cloud_sidebar_section_logs"),
            icon: "fa fa-bar-chart",
            state: "dbaas.logs.welcome"
        };
    }
}

angular.module("managerApp").service("LogsSidebar", LogsSidebar);
