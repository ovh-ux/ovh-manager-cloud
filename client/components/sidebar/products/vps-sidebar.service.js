import { MANAGER_URLS } from '../sidebar.constants';

class VpsSidebar {
  constructor($translate, CucConfig, OvhApiMe, SidebarMenu, REDIRECT_URLS, URLS) {
    this.$translate = $translate;
    this.User = OvhApiMe;
    this.SidebarMenu = SidebarMenu;
    this.REDIRECT_URLS = REDIRECT_URLS;
    this.URLS = URLS;

    this.region = CucConfig.getRegion();
    this.locale = null;
    this.type = 'VPS';

    this.User.v6().get().$promise
      .then((user) => {
        this.locale = user.ovhSubsidiary;
      });
  }

  loadIntoSection(section, services) {
    _.forEach(services, (vps) => {
      const menuItem = this.SidebarMenu.addMenuItem({
        id: vps.serviceName,
        title: vps.displayName || vps.serviceName,
        icon: 'ovh-font ovh-font-vps',
        url: `${_.get(MANAGER_URLS, `${this.region}.CLOUD`, MANAGER_URLS.EU.CLOUD)}#/iaas/vps/${vps.serviceName}`,
        stateParams: {
          serviceName: vps.serviceName,
        },
        loadOnState: 'iaas.vps.detail',
        loadOnStateParams: {
          serviceName: vps.serviceName,
        },
      }, section);
      this.constructor.addSearchKeys(menuItem);
    });
  }

  static addSearchKeys(menuItem) {
    menuItem.addSearchKey('VPS');
  }

  addOrder() {
    return {
      id: 'order-vps',
      title: this.$translate.instant('cloud_sidebar_actions_menu_vps'),
      icon: 'ovh-font ovh-font-server2',
      href: this.URLS.website_order.vps[this.locale],
      target: '_blank',
      external: true,
    };
  }
}

angular.module('managerApp').service('VpsSidebar', VpsSidebar);
