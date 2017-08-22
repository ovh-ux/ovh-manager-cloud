class ControllerNavigationHelper {
    constructor (REDIRECT_URLS) {
        this.REDIRECT_URLS = REDIRECT_URLS;
    }

    getUrl (pageId, params) {
        let url = this.REDIRECT_URLS[pageId];
        _.forEach(_.keys(params), key => {
            url = url.replace(`{${key}}`, params[key]);
        });

        return url;
    }
}

angular.module("managerApp").service("ControllerNavigationHelper", ControllerNavigationHelper);
