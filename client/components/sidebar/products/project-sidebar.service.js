class CloudProjectSidebar {
  constructor($translate, OvhApiMe, SidebarMenu, URLS, TARGET) {
    this.$translate = $translate;
    this.OvhApiMe = OvhApiMe;
    this.SidebarMenu = SidebarMenu;
    this.URLS = URLS;
    this.TARGET = TARGET;

    this.type = 'PROJECT';

    this.locale = null;
    this.OvhApiMe.v6().get().$promise
      .then((user) => {
        this.locale = user.ovhSubsidiary;
      });
  }

  loadIntoSection(section, services) {
    const servicesSorted = _.sortBy(services, project => project.displayName.toUpperCase());
    _.forEach(servicesSorted, (project) => {
      this.SidebarMenu.addMenuItem({
        id: project.serviceName,
        title: project.displayName || project.serviceName,
        icon: 'ovh-font ovh-font-cloud-public2',
        state: 'iaas.pci-project.compute.infrastructure.diagram',
        stateParams: {
          projectId: project.serviceName,
        },
        loadOnState: 'iaas.pci-project.compute.infrastructure.diagram',
        loadOnStateParams: {
          projectId: project.serviceName,
        },
      }, section);
    });
  }

  addSearchKeys(menuItem) {
    menuItem.addSearchKey('PCI');
    menuItem.addSearchKey('Public Cloud Public');
    menuItem.addSearchKey(this.$translate.instant('cloud_sidebar_actions_menu_cloud_project'));
  }

  addOrder() {
    return {
      id: 'order-pci-project-new',
      title: this.$translate.instant('cloud_sidebar_actions_menu_cloud_project'),
      icon: 'ovh-font ovh-font-public-cloud',
      href: this.URLS.manager_order.public_cloud_project[this.locale],
    };
  }

  addToSection(service) {
    const section = this.SidebarMenu.getItemById('mainIaasItem');
    this.SidebarMenu.addMenuItem({
      id: service.project_id,
      title: service.description,
      icon: 'ovh-font ovh-font-cloud-public2',
      loadOnState: 'iaas.pci-project.compute',
      stateParams: {
        projectId: service.project_id,
      },
      loadOnStateParams: {
        projectId: service.project_id,
      },
    }, section);
  }
}

angular.module('managerApp').service('CloudProjectSidebar', CloudProjectSidebar);
