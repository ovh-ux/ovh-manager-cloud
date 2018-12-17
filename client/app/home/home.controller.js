angular
  .module('managerApp')
  .controller('homeCtrl', class Home {
    constructor(
      $q,

      DocsService,
      FeatureAvailabilityService,
      OvhApiMe,

      URLS,
    ) {
      this.$q = $q;

      this.DocsService = DocsService;
      this.FeatureAvailabilityService = FeatureAvailabilityService;
      this.OvhApiMe = OvhApiMe;

      this.URLS = URLS;
    }

    $onInit() {
      this.defaultSections = ['PROJECT', 'VPS'];
      this.guides = {
        all: this.DocsService.getAllGuidesLink(),
      };

      this.helpCenterURLs = this.URLS.support;

      return this.fetchingSubsidiary()
        .then(() => this.setSections());
    }

    fetchingSubsidiary() {
      return this.OvhApiMe.v6()
        .get().$promise
        .then(({ ovhSubsidiary: subsidiary }) => {
          this.subsidiary = subsidiary;
        });
    }

    setSections() {
      const sectionsPromise = _.map(
        this.defaultSections,
        section => this.FeatureAvailabilityService.hasFeaturePromise(section, 'guides'),
      );

      return this.$q
        .all(sectionsPromise)
        .then((sections) => {
          this.guides.sections = this.defaultSections
            .filter((value, index) => sections[index])
            .map(section => this.DocsService.getGuidesOfSection(section));
        });
    }
  });
