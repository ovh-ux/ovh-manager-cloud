class ControllerNavigationHelper {
    constructor ($location, $state, $timeout, OvhApiMe, REDIRECT_URLS, TARGET, URLS) {
        this.$location = $location;
        this.$state = $state;
        this.$timeout = $timeout;
        this.OvhApiMe = OvhApiMe;
        this.REDIRECT_URLS = REDIRECT_URLS;
        this.TARGET = TARGET;
        this.URLS = URLS;
    }

    addQueryParam (name, value) {
        this.$state.current.reloadOnSearch = false;
        this.$location.search(name, value);
        this.$timeout(() => {
            this.$state.current.reloadOnSearch = undefined;
        });
    }

    getQueryParam (name) {
        return this.$location.search()[name];
    }

    getUrl (pageId, params) {
        let url = this.REDIRECT_URLS[pageId];
        if (!url) {
            return null;
        }

        _.forEach(_.keys(params), key => {
            url = url.replace(`{${key}}`, params[key]);
        });

        return url;
    }

    getConstant (constantName) {
        const path = _.get(this.URLS, constantName);
        const fallback = this.TARGET === "US" ? "US" : "GB";

        return this.OvhApiMe.Lexi().get().$promise
            .then(me => path[me.ovhSubsidiary] || path[fallback] || path.FR);
    }
}

angular.module("managerApp").service("ControllerNavigationHelper", ControllerNavigationHelper);
