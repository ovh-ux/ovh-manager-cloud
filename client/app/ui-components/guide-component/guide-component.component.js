(() => {
    "use strict";

    class GuideComponentController {
        /**
          * Check the use case of a simple guide or a simple list of guides
          */
        hasSimpleGuide (guide) {
            if (guide.constructor === Object && guide.list.constructor === Array) {
                const firstGuide = guide.list[0];
                return guide.title !== undefined && firstGuide.name !== undefined && firstGuide.url !== undefined;
            }
            return false;
        }

        /**
          * Check the use case of a multiple list guide classified into sections
          */
        hasMultipleGuide (guides) {
            if (guides.constructor === Object && guides.sections.constructor === Array) {
                const firstSection = guides.sections[0];
                return firstSection.title !== undefined && firstSection.list !== undefined;
            }
            return false;
        }
    }

    angular.module("managerApp")
        .component("guideComponent", {
            controller: GuideComponentController,
            bindings: {
                guides: "<"
            },
            transclude: true,
            templateUrl: "app/ui-components/guide-component/guide-component.html"
        });
})();
