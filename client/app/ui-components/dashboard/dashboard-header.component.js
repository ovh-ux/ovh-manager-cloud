angular.module("managerApp")
    .component("cuiPageHeader", {
        template: `
            <header class="cui-page__header">
                <cui-page-header-title 
                    data-text="$ctrl.titleText"
                    data-subtitle-text="$ctrl.subtitleText"
                    data-ng-if="$ctrl.titleText"></cui-page-header-title>
                <ng-transclude></ng-transclude>
            </header>
        `,
        transclude: true,
        bindings: {
            titleText: "<",
            subtitleText: "<"
        }
    }).component("cuiPageHeaderTitle", {
        template: `
            <h1 class="cui-page__header__title" data-ng-bind="$ctrl.text"></h1>
            <h2 class="cui-page__header__subtitle" data-ng-if="$ctrl.subtitleText" data-ng-bind="$ctrl.subtitleText"></h2>
        `,
        bindings: {
            text: "<",
            subtitleText: "<"
        }
    });
