(() => {
    "use strict";

    class OuiInlineColorAlertController {

        getClass () {
            return `oui-inline-color-alert__${this.type}`;
        }
    }

    angular.module("managerApp")
        .component("ouiInlineColorAlert", {
            template: `
                <div class="oui-inline-color-alert">
                    <span data-ng-class="$ctrl.getClass()" class="inline-block oui-inline-color-alert__circle"></span>
                    <strong><span class="oui-inline-color-alert__label" data-ng-bind="$ctrl.label"></span></strong>
                </div>
            `,
            controller: OuiInlineColorAlertController,
            controllerAs: "$ctrl",
            bindings: {
                type: "<",
                label: "@"
            }
        });
})();
