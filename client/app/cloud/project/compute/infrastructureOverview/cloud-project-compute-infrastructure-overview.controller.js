angular.module("managerApp").controller("CloudProjectComputeInfrastructureOverviewCtrl",
function (URLS, OvhApiMe, $state, $stateParams, $q, $translate, CloudUserPref, CloudMessage) {
    "use strict";

    var self = this;
    var serviceName = $stateParams.projectId;

    this.guideUrl = null;
    this.loaders = {
        init: true,
        redirect: false
    };
    this.neverShowAgain = false;

    function assignGuideUrl() {
        return OvhApiMe.Lexi().get().$promise
            .then(function(user) {
                self.guideUrl = URLS.guides.cloud[user.ovhSubsidiary] ||
                                URLS.guides.home[user.ovhSubsidiary] ||
                                URLS.guides.home.FR;
                return self.guideUrl;
            })["catch"](function() {
                self.guideUrl = URLS.guides.home.FR;
                return self.guideUrl;
            });
    }

    self.redirectToInterface = function() {
        var maybeSaveToCache = $q.when({});
        self.loaders.redirect = true;
        if (self.neverShowAgain) {
            maybeSaveToCache = CloudUserPref.set("cloud_project_" + serviceName + "_overview", {
                hide: true
            })["catch"](function (err) {
                CloudMessage.error([$translate.instant("infra_overview_tips_never_again_error"), err.data && err.data.message || ""].join(" "));
            });
        }
        return maybeSaveToCache.then(function () {
            return $state.go("iaas.pci-project.compute", { forceLargeProjectDisplay: true }, { reload: true });
        })["finally"](function() {
            self.loaders.redirect = false;
        });
    };

    function init() {
        self.loaders.init = true;
        assignGuideUrl()
            ["finally"](function() {
                self.loaders.init = false;
            });
    }

    init();
});
