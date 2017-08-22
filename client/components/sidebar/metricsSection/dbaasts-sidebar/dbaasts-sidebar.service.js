class DBaasTsSidebar {
    constructor ($translate, User, SidebarMenu, DBaasTsConstants) {
        this.$translate = $translate;
        this.User = User;
        this.SidebarMenu = SidebarMenu;
        this.DBaasTsConstants = DBaasTsConstants;

        this.locale = null;
        this.User.Lexi().get().$promise
            .then(user => {
                this.locale = user.ovhSubsidiary;
            });
    }

    loadIntoSection (section, services) {
        _.forEach(services, project => {
            const menuItem = this.SidebarMenu.addMenuItem({
                id: project.serviceName,
                title: project.displayName || project.serviceName,
                icon: "graph",
                allowSubItems: false,
                state: "dbaas.metrics.detail.dashboard",
                stateParams: {
                    serviceName: project.serviceName
                }
            }, section);
            this.addSearchKeys(menuItem);
        });
    }

    addSearchKeys (menuItem) {
        menuItem.addSearchKey("IOT");
        menuItem.addSearchKey("Metrics");
        menuItem.addSearchKey("Monitoring");
        menuItem.addSearchKey("Time Series");
        menuItem.addSearchKey("TimeSeries");
        menuItem.addSearchKey(this.$translate.instant("cloud_sidebar_actions_menu_dbaas_ts"));
    }

    addOrder () {
        return {
            title: this.$translate.instant("cloud_sidebar_actions_menu_dbaas_ts"),
            icon: "graph",
            href: this.DBaasTsConstants.urls.order[this.locale],
            target: "_blank"
        }
    }
}

angular.module("managerApp").service("DBaasTsSidebar", DBaasTsSidebar);
