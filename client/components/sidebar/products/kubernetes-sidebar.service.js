class KubernetesSidebar {
  constructor($translate, OvhApiMe, SidebarMenu, URLS) {
    this.$translate = $translate;
    this.User = OvhApiMe;
    this.SidebarMenu = SidebarMenu;
    this.URLS = URLS;

    this.type = 'KUBE';
    this.locale = null;
    this.User.v6().get().$promise
      .then((user) => {
        this.locale = user.ovhSubsidiary;
      });
  }

  loadIntoSection(section, services) {
    _.forEach(services, (service) => {
      const menuItem = this.SidebarMenu.addMenuItem({
        id: service.serviceName,
        title: service.displayName || service.serviceName,
        icon: 'ovh-font ovh-font-cloud-public2',
        allowSubItems: false,
        state: 'paas.kube.service',
        stateParams: {
          serviceName: service.serviceName,
        },
        loadOnState: 'paas.kube',
        loadOnStateParams: {
          serviceName: service.serviceName,
        },
      }, section);
      this.addSearchKeys(menuItem);
    });
  }

  addSearchKeys(menuItem) {
    menuItem.addSearchKey('Kubernetes');
    menuItem.addSearchKey('KUBE');
    menuItem.addSearchKey(this.$translate.instant('cloud_sidebar_actions_menu_paas_kube'));
  }
}

angular.module('managerApp').service('KubernetesSidebar', KubernetesSidebar);
