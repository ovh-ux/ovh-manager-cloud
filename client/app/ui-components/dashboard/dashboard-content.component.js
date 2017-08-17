angular.module("managerApp")
    .component("cuiPageContentTitle", {
        template: `
            <h3 class="oui-header_3" data-ng-bind=":: $ctrl.text"></h3>
        `,
        transclude: true,
        bindings: {
            text: "<"
        }
    });
