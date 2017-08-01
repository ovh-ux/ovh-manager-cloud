angular.module("managerApp")
    .component("cuiBackLink", {
        template: `
            <a ui-sref="{{ $ctrl.state + '(' + String($ctrl.stateParams) + ')' }}"
                class="oui-button oui-button_link oui-button_icon-left">
                <i class="oui-icon oui-icon-chevron-left" aria-hidden="true"></i><span data-ng-bind="$ctrl.text"></span>
            </a>
        `,
        bindings: {
            state: "@",
            stateParams: "<",
            text: "<"
        }
    });
