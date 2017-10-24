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
    })
    .component("cuiActionButton", {
        template: `
            <cui-button data-ng-if="$ctrl.action.callback"
                data-text="$ctrl.action.text" 
                data-on-click="$ctrl.action.callback()"
                data-disabled="$ctrl.action.isAvailable && !$ctrl.action.isAvailable()"
                data-type="{{ $ctrl.type }}"></cui-button>
            <a data-ng-if="$ctrl.action.state"
                class="oui-button oui-button_{{ $ctrl.type }}"
                data-ui-sref="{{ $ctrl.action.state + $ctrl.getActionStateParamString() }}"
                data-ng-bind="$ctrl.action.text" 
                data-ng-disabled="$ctrl.action.isAvailable && !$ctrl.action.isAvailable()"
                data-type="{{ $ctrl.type }}"></a>
            <a data-ng-if="$ctrl.action.href"
                class="oui-button oui-button_{{ $ctrl.type }}"
                data-ng-href="{{ $ctrl.action.href }}"
                data-ng-bind="$ctrl.action.text"
                data-ng-disabled="$ctrl.action.isAvailable && !$ctrl.action.isAvailable()"
                data-type="{{ $ctrl.type }}"></a>
        `,
        controller: class cuiActionButtonController {
            getActionStateParamString () {
                if (!this.action.stateParams) { return ""; }
                return `(${JSON.stringify(this.action.stateParams)})`;
            }
        },
        bindings: {
            action: "<",
            type: "@"
        }
    });
