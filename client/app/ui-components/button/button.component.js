angular.module("managerApp")
    .component("cuiButton", {
        template: `
            <button class="oui-button oui-button_{{ $ctrl.type }}"
                    type="submit"
                    data-ng-bind="$ctrl.text"
                    data-ng-click="$ctrl.onClick()"
                    data-ng-disabled="$ctrl.disabled"></button>
        `,
        bindings: {
            text: "<",
            onClick: "&",
            disabled: "<",
            type: "@"
        }
    })
    .component("cuiSubmitButton", {
        template: `
            <button class="oui-button oui-button_primary"
                    type="submit"
                    data-ng-bind="$ctrl.text"
                    data-ng-click="$ctrl.onClick()"
                    data-ng-disabled="$ctrl.disabled"></button>
        `,
        bindings: {
            text: "<",
            onClick: "&",
            disabled: "<"
        }
    })
    .component("cuiCancelButton", {
        template: `
            <button class="oui-button oui-button_secondary"
                    type="button"
                    data-ng-bind="$ctrl.text"
                    data-ng-click="$ctrl.onClick()"
                    data-ng-disabled="$ctrl.disabled"></button>
        `,
        bindings: {
            text: "<",
            onClick: "&",
            disabled: "<"
        }
    });
