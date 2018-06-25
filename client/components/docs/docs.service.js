{
    class DocsService {
        constructor ($translate, OvhApiMe, TranslateService, TARGET, DOCS_ALL_GUIDES, DOCS_HOMEPAGE_GUIDES) {
            this.$translate = $translate;

            this.OvhApiMe = OvhApiMe;
            this.TranslateService = TranslateService;

            this.TARGET = TARGET;
            this.DOCS_ALL_GUIDES = DOCS_ALL_GUIDES;
            this.DOCS_HOMEPAGE_GUIDES = DOCS_HOMEPAGE_GUIDES;
        }

        fetchSubsidiary () {
            return this.OvhApiMe.v6()
                .get().$promise
                .then(me => me.ovhSubsidiary);
        }

        fetchRootGuidePageLink () {
            return this.fetchSubsidiary()
                .then(subsidiaryName => {
                    const matchingGuide = this.DOCS_ALL_GUIDES[subsidiaryName];

                    return _(matchingGuide).isString() ? matchingGuide : this.DOCS_ALL_GUIDES.DEFAULT;
                });
        }

        fetchGuidePageLinkFor (sectionName) {
            return this.fetchSubsidiary()
                .then(subsidiaryName => {
                    const matchingHomepageGuides = this.DOCS_HOMEPAGE_GUIDES[subsidiaryName];
                    const homepageGuides = _(matchingHomepageGuides).isObject() ? matchingHomepageGuides : this.DOCS_HOMEPAGE_GUIDES.DEFAULT;

                    const matchingSectionGuide = homepageGuides[sectionName];

                    return {
                        title: matchingSectionGuide.title,
                        list: _(matchingSectionGuide.list)
                            .map(originalGuide => {
                                const guide = _(originalGuide).clone();
                                guide.displayText = this.$translate.instant(guide.text);
                                return guide;
                            }).value()
                    };
                });
        }
    }

    angular.module("managerApp").service("DocsService", DocsService);
}
