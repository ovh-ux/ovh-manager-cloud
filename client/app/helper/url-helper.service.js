(() => {
  class UrlHelper {
    static findUrl(item, type) {
      const urlObj = _.find(item.urls, url => url.type === type);
      return urlObj && urlObj.address ? urlObj.address : '';
    }
  }

  angular.module('managerApp').service('UrlHelper', UrlHelper);
})();
