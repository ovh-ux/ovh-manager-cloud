class CloudProjectSidebar {
    constructor ($translate, SidebarMenu) {
        this.$translate = $translate;
        this.SidebarMenu = SidebarMenu;

        this.type = "PROJECT";
    }

    loadIntoSection (section, services) {
        const servicesSorted = _.sortBy(services, project => {
            return project.displayName.toUpperCase();
        });
        _.forEach(servicesSorted, project => {
            this.SidebarMenu.addMenuItem({
                id: project.serviceName,
                title: project.displayName || project.serviceName,
                icon: "ovh-font ovh-font-cloud-public2",
                state: "iaas.pci-project.compute",
                stateParams: {
                    projectId: project.serviceName
                },
                loadOnState: "iaas.pci-project.compute",
                loadOnStateParams: {
                    projectId: project.serviceName
                }
            }, section);
        });
    }

    addSearchKeys (menuItem) {
        menuItem.addSearchKey("PCI");
        menuItem.addSearchKey("Public Cloud Public");
        menuItem.addSearchKey(this.$translate.instant("cloud_sidebar_actions_menu_cloud_project"));
    }

    addOrder () {
        return {
            id: "order-pci-project-new",
            title: this.$translate.instant("cloud_sidebar_actions_menu_cloud_project"),
            icon: "ovh-font ovh-font-public-cloud",
            state: "iaas.pci-project-new"
        };
    }

    addToSection (service) {
        let section = this.SidebarMenu.getItemById("mainIaasItem");
        const hasSubItems = section.subItems.length > 0;
        let projectItem = this.SidebarMenu.addMenuItem({
            id: service.project_id,
            title: service.description,
            icon: "ovh-font ovh-font-cloud-public2",
            allowSubItems: true,
            loadOnState: "iaas.pci-project",
            loadOnStateParams: {
                projectId: service.project_id
            }
        }, section);
        //For each Item, add Infra/ObjectStorage/Facturation
        this.fillCloudProjectSubSection(service, projectItem);

        //Show on top: TODO: show in alphabetical order
        if (hasSubItems) {
            _.remove(section.subItems, item => {
                return item.id === service.project_id;
            });
            section.subItems.unshift(projectItem);
        }
    }
}

angular.module("managerApp").service("CloudProjectSidebar", CloudProjectSidebar);
