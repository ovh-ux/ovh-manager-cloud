class HomeCtrl {
  constructor($q, $translate, DocsService, FeatureAvailabilityService) {
    this.$q = $q;
    this.$translate = $translate;

    this.DocsService = DocsService;
    this.FeatureAvailabilityService = FeatureAvailabilityService;
  }

  $onInit() {
    this.defaultSections = ['PROJECT', 'VPS'];
    this.guides = {};
    this.guides.all = this.DocsService.getAllGuidesLink();

    this.buildSummitData();

    return this.setSections();
  }

  setSections() {
    const sectionsPromise = _.map(this.defaultSections, section => this.FeatureAvailabilityService.hasFeaturePromise(section, 'guides'));

    return this.$q.all(sectionsPromise)
      .then((sections) => {
        this.guides.sections = _.chain(this.defaultSections)
          .filter((value, index) => sections[index])
          .map(section => this.DocsService.getGuidesOfSection(section))
          .value();
        return this.guides.sections;
      });
  }

  buildSummitData() {
    this.localeForSummitBanner = this.$translate.use().split('_')[0] === 'fr' ? 'fr' : 'en';
  }
}

angular.module('managerApp').controller('HomeCtrl', HomeCtrl);
