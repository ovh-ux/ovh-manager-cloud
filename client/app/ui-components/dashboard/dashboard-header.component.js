angular.module("managerApp")
    .component("cuiPageHeader", {
        template: `
            <header class="cui-page__header">
                <cui-page-header-title 
                    data-text="$ctrl.titleText"
                    data-cloud-project-title="$ctrl.cloudProjectTitle"
                    data-subtitle-text="$ctrl.subtitleText"
                    data-guides="$ctrl.guides"></cui-page-header-title>
                <ng-transclude></ng-transclude>
            </header>
        `,
        transclude: true,
        bindings: {
            titleText: "<",
            cloudProjectTitle: "<",
            subtitleText: "<",
            guides: "<"
        }
    }).component("cuiPageHeaderTitle", {
        template: `
            <guide-component data-ng-if="$ctrl.guides" class="pull-right" data-guides="$ctrl.guides"></guide-component>
            <h1 class="cui-page__header__title" data-ng-if="$ctrl.text" data-ng-bind="$ctrl.text"></h1>
            <cloud-project-rename data-ng-if="$ctrl.cloudProjectTitle" data-project-id="$ctrl.cloudProjectTitle"></cloud-project-rename>
            <h2 class="cui-page__header__subtitle" data-ng-if="$ctrl.subtitleText" data-ng-bind="$ctrl.subtitleText"></h2>
        `,
        bindings: {
            text: "<",
            cloudProjectTitle: "<",
            subtitleText: "<",
            guides: "<"
        }
    });
