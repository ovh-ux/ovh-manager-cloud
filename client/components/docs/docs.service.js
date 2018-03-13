class DocsService {
    constructor ($translate, TranslateService, TARGET, DOCS_ALL_GUIDES, DOCS_HOMEPAGE_GUIDES) {
        this.$translate = $translate;
        this.TranslateService = TranslateService;
        this.TARGET = TARGET;
        this.DOCS_ALL_GUIDES = DOCS_ALL_GUIDES;
        this.DOCS_HOMEPAGE_GUIDES = DOCS_HOMEPAGE_GUIDES;
    }

    getDomainOfGuides () {
        if (this.TARGET === "US") {
            return "US";
        }
        const locale = this.TranslateService.getGeneralLanguage();

        if (locale === "fr") {
            return "FR";
        }
        return "EN";
    }

    getAllGuidesLink () {
        const domain = this.getDomainOfGuides();
        switch (domain) {
            case "US":
                return this.DOCS_ALL_GUIDES.US;
            case "FR":
                return this.DOCS_ALL_GUIDES.FR;
            case "EN":
            default:
                return this.DOCS_ALL_GUIDES.EN;
        }
    }

    getGuidesOfSection (section) {
        const domain = this.getDomainOfGuides();
        const sectionContent = this.DOCS_HOMEPAGE_GUIDES[domain][section];

        sectionContent.list = _.map(sectionContent.list, guide => {
            guide.text = this.$translate.instant(guide.text);
            return guide;
        });

        console.log(sectionContent);

        return sectionContent;
    }
}

angular.module("managerApp").service("DocsService", DocsService);
