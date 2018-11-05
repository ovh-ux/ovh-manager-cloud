class NavbarNotificationService {
  constructor(
    $interval, $q, $translate,
    atInternet, CloudMessage, OvhApiNotificationAapi,
    TARGET, UNIVERSE,
  ) {
    this.$interval = $interval;
    this.$q = $q;
    this.$translate = $translate;
    this.atInternet = atInternet;
    this.CloudMessage = CloudMessage;
    this.OvhApiNotificationAapi = OvhApiNotificationAapi;
    this.TARGET = TARGET;
    this.UNIVERSE = UNIVERSE;

    this.NOTIFICATION_REFRESH_TIME = 60000;
  }

  getMessages() {
    return this.$translate.refresh().then(() => this.OvhApiNotificationAapi.query({
      lang: this.$translate.preferredLanguage(),
      target: this.TARGET,
      universe: this.UNIVERSE,
    }).$promise.catch((error) => {
      this.CloudMessage.error({ textHtml: error.message }, 'index');
      throw error;
    }));
  }

  getSubLinks() {
    return this
      .getMessages()
      .then(messages => messages.map(message => this.convertSubLink(message)))
      .catch(() => undefined);
  }

  static formatTime(dateTime) {
    return moment(dateTime).fromNow();
  }

  toggleSublinkAction(toUpdate, linkClicked) {
    if (toUpdate.isActive && !toUpdate.updating) {
      _.set(toUpdate, 'updating', true);
      this.OvhApiNotificationAapi.post({ completed: [toUpdate.id] }).$promise.then(() => {
        _.set(toUpdate, 'isActive', false);
        _.set(toUpdate, 'acknowledged', true);
      }).finally(() => { _.set(toUpdate, 'updating', false); });
    } else if (!toUpdate.isActive && !toUpdate.updating && !linkClicked) {
      _.set(toUpdate, 'updating', true);
      this.OvhApiNotificationAapi.post({ acknowledged: [toUpdate.id] }).$promise.then(() => {
        _.set(toUpdate, 'isActive', true);
        _.set(toUpdate, 'acknowledged', true);
      }).finally(() => { _.set(toUpdate, 'updating', false); });
    }
  }

  convertSubLink(notification) {
    _.set(notification, 'time', this.constructor.formatTime(notification.date));
    _.set(notification, 'url', notification.urlDetails.href);
    _.set(notification, 'isActive', _.contains(['acknowledged', 'delivered'], notification.status));
    _.set(notification, 'acknowledged', _.contains(['acknowledged', 'completed', 'unknown'], notification.status));
    _.set(notification, 'actionClicked', toUpdate => this.toggleSublinkAction(toUpdate));
    _.set(notification, 'linkClicked', toUpdate => this.toggleSublinkAction(toUpdate, true));
    return notification;
  }

  aknowledgeAll() {
    if (this.navbarContent) {
      const toAcknowledge = this.navbarContent.subLinks
        .filter(subLink => !subLink.acknowledged && subLink.isActive);
      if (toAcknowledge.length) {
        this.OvhApiNotificationAapi
          .post({ acknowledged: toAcknowledge.map(x => x.id) }).$promise
          .then(() => {
            toAcknowledge.forEach((sublink) => {
              _.set(sublink, 'acknowledged', true);
            });
          });
      }
    }
  }

  setRefreshTime(sublinks) {
    if (this.formatTimeTask) {
      this.$interval.cancel(this.formatTimeTask);
    }
    this.formatTimeTask = this.$interval(() => {
      sublinks.forEach((notification) => {
        _.set(notification, 'time', this.constructor.formatTime(notification.date));
      });
    }, this.NOTIFICATION_REFRESH_TIME);
  }

  getNavbarContent() {
    return this.getSubLinks().then((sublinks) => {
      this.setRefreshTime(sublinks);
      const navbarContent = {
        name: 'notifications',
        title: this.$translate.instant('common_navbar_notification_title'),
        iconClass: 'icon-notifications',
        limitTo: 10,
        onClick: () => {
          this.aknowledgeAll();
          this.atInternet.trackClick({
            name: 'notifications',
            type: 'action',
          });
        },
        subLinks: sublinks,
        show: true,
      };
      this.navbarContent = navbarContent;
      return navbarContent;
    });
  }
}

angular.module('managerApp').service('NavbarNotificationService', NavbarNotificationService);
