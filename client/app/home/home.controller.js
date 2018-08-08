class HomeCtrl {
    constructor ($q, DocsService, FeatureAvailabilityService, OvhApiCloudProject, OvhApiCloudProjectRegion) {
        this.$q = $q;
        this.DocsService = DocsService;
        this.FeatureAvailabilityService = FeatureAvailabilityService;
        this.OvhApiCloudProject = OvhApiCloudProject;
        this.OvhApiCloudProjectRegion = OvhApiCloudProjectRegion;
    }

    $onInit () {
        this.defaultSections = ["PROJECT", "VPS"];
        this.guides = {};
        this.guides.all = this.DocsService.getAllGuidesLink();
        this.hasAScheduledMaintenanceOperation = null;

        return this.setSections()
            .then(() => this.getAllRegions());
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

    getAllRegions () {
        return this.OvhApiCloudProject.v6()
            .query().$promise
            .then(cloudProjects => this.$q
                .all(_.map(cloudProjects, cloudProject => this.OvhApiCloudProjectRegion.v6()
                    .query({ serviceName: cloudProject }).$promise
                    .catch(() => [])))
                .then(allRegions => _(allRegions).flatten().uniq().value()))
            .then(regions => {
                this.hasAScheduledMaintenanceOperation = _.indexOf(regions, "BHS3") > -1 && moment().isBefore("2018-08-23");
                return regions;
            });
    }
}

angular.module("managerApp").controller("HomeCtrl", HomeCtrl);
