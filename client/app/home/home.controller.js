class HomeCtrl {
    constructor ($q, $translate, TranslateService, FeatureAvailabilityService, DocsService) {
        this.$translate = $translate;
        this.TranslateService = TranslateService;
        this.FeatureAvailabilityService = FeatureAvailabilityService;
        this.DocsService = DocsService;
        this.guides = {};
        this.$q = $q;
        this.defaultSections = ["PROJECT", "VPS"];
    }

    $onInit () {
        this.guides.all = this.DocsService.getAllGuidesLink();
        this.setSections();
    }

    setSections () {
        const sectionsPromise = _.map(this.defaultSections, section => this.FeatureAvailabilityService.hasFeaturePromise(section, "guides"));

        return this.$q.all(sectionsPromise)
            .then(sections => {
                this.guides.sections = _.chain(this.defaultSections)
                    .filter((value, index) => sections[index])
                    .map(section => this.DocsService.getGuidesOfSection(section))
                    .value();
            });
    }

}

angular.module("managerApp").controller("HomeCtrl", HomeCtrl);
