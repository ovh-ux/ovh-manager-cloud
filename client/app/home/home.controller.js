class HomeCtrl {
    constructor ($q, DocsService, FeatureAvailabilityService) {
        this.$q = $q;
        this.DocsService = DocsService;
        this.FeatureAvailabilityService = FeatureAvailabilityService;
    }

    $onInit () {
        this.defaultSections = ["PROJECT", "VPS"];
        this.guides = {};
        this.guides.all = this.DocsService.getAllGuidesLink();

        return this.setSections();
    }

    setSections () {
        const sectionsPromise = _.map(this.defaultSections, section => this.FeatureAvailabilityService.hasFeaturePromise(section, "guides"));

        return this.$q.all(sectionsPromise)
            .then(sections => {
                this.guides.sections = _.chain(this.defaultSections)
                    .filter((value, index) => sections[index])
                    .map(section => this.DocsService.getGuidesOfSection(section))
                    .value();
                return this.guides.sections;
            });
    }
}

angular.module("managerApp").controller("HomeCtrl", HomeCtrl);
