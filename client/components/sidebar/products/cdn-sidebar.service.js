class CdnSidebar {
  constructor($translate, SidebarMenu, REDIRECT_URLS) {
    this.$translate = $translate;
    this.SidebarMenu = SidebarMenu;
    this.REDIRECT_URLS = REDIRECT_URLS;

    this.type = 'CDN';
  }

  loadIntoSection(section, services) {
    _.forEach(services, (cdn) => {
      const menuItem = this.SidebarMenu.addMenuItem({
        id: cdn.serviceName,
        title: cdn.displayName || cdn.serviceName,
        icon: 'ovh-font ovh-font-cdn',
        target: '_parent',
        url: this.REDIRECT_URLS.cdnPage.replace('{cdn}', cdn.serviceName),
      }, section);
      this.constructor.addSearchKeys(menuItem);
    });
  }

  static addSearchKeys(menuItem) {
    menuItem.addSearchKey('Content Delivery Network');
  }
}

angular.module('managerApp').service('CdnSidebar', CdnSidebar);
