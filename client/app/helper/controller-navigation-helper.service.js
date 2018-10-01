class ControllerNavigationHelper {
  constructor(OvhApiMe, REDIRECT_URLS, TARGET, URLS) {
    this.OvhApiMe = OvhApiMe;
    this.REDIRECT_URLS = REDIRECT_URLS;
    this.TARGET = TARGET;
    this.URLS = URLS;
  }

  getUrl(pageId, params) {
    let url = this.REDIRECT_URLS[pageId];
    if (!url) {
      return null;
    }

    _.forEach(_.keys(params), (key) => {
      url = url.replace(`{${key}}`, params[key]);
    });

    return url;
  }

  getConstant(constantName) {
    const path = _.get(this.URLS, constantName);
    const fallback = this.TARGET === 'US' ? 'US' : 'GB';

    return this.OvhApiMe.v6().get().$promise
      .then(me => path[me.ovhSubsidiary] || path[fallback] || path.FR);
  }
}

angular.module('managerApp').service('ControllerNavigationHelper', ControllerNavigationHelper);
