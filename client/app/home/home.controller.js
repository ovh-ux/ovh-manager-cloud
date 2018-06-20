class HomeCtrl {
    constructor ($q, $translate, DocsService, FeatureAvailabilityService, TranslateService) {
        this.$q = $q;
        this.$translate = $translate;

        this.DocsService = DocsService;
        this.FeatureAvailabilityService = FeatureAvailabilityService;
        this.TranslateService = TranslateService;
    }

    $onInit () {
        this.defaultSections = ["PROJECT", "VPS"];
        this.guides = {};

        this.isLoading = true;
        this.fetchRootGuidePageLink()
            .then(() => this.fetchGuidePageLinkForAllSections())
            .finally(() => {
                this.isLoading = false;
            });
    }

    fetchRootGuidePageLink () {
        return this.DocsService
            .fetchRootGuidePageLink()
            .then(rootGuidePageLink => {
                this.guides.all = rootGuidePageLink;
            })
            .catch(error => {
                this.CloudMessage.error(`${this.$translate.instant("cpa_error")} ${_(error).get("data.message", "")}`);
            });
    }

    fetchGuidePageLinkForAllSections () {
        return this.$q
            .all(
                _(this.defaultSections).map(section => this.FeatureAvailabilityService.hasFeaturePromise(section, "guides")).value()
            )
            .then(sections => this.$q.all(
                _(this.defaultSections).chain()
                    .filter((value, index) => sections[index])
                    .map(sectionName => this.DocsService.fetchGuidePageLinkFor(sectionName))
                    .value()
            ))
            .then(sections => {
                this.guides.sections = sections;
            })
            .catch(error => {
                this.CloudMessage.error(`${this.$translate.instant("cpa_error")} ${_(error).get("data.message", "")}`);
            });
    }
}

angular.module("managerApp").controller("HomeCtrl", HomeCtrl);
