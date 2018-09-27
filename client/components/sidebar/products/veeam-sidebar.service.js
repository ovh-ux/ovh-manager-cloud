class VeeamSidebar {
  constructor($translate, OvhApiMe, SidebarMenu, URLS) {
    this.$translate = $translate;
    this.User = OvhApiMe;
    this.SidebarMenu = SidebarMenu;
    this.URLS = URLS;

    this.locale = null;
    this.type = 'VEEAM';

    this.User.v6().get().$promise
      .then((user) => {
        this.locale = user.ovhSubsidiary;
      });
  }

  loadIntoSection(section, services) {
    _.forEach(services, (service) => {
      const menuItem = this.SidebarMenu.addMenuItem({
        id: service.serviceName,
        title: service.serviceName,
        icon: 'ovh-font ovh-font-veeam',
        allowSubItems: false,
        state: 'paas.veeam.detail.dashboard',
        stateParams: {
          serviceName: service.serviceName,
        },
        loadOnState: 'paas.veeam.detail',
        loadOnStateParams: {
          serviceName: service.serviceName,
        },
      }, section);
      this.addSearchKeys(menuItem);
    });
  }

  addSearchKeys(menuItem) {
    menuItem.addSearchKey('Veeam Cloud Connect');
    menuItem.addSearchKey('VEEAM');
    menuItem.addSearchKey(this.$translate.instant('cloud_sidebar_actions_menu_paas_veeam'));
  }

  addOrder() {
    return {
      id: 'order-veeam',
      title: this.$translate.instant('cloud_sidebar_actions_menu_paas_veeam'),
      icon: 'ovh-font ovh-font-veeam',
      href: this.URLS.website_order.veeam[this.locale],
      target: '_blank',
      external: true,
    };
  }
}

angular.module('managerApp').service('VeeamSidebar', VeeamSidebar);
