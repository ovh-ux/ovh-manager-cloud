(() => {
    "use strict";

    class OuiInlineColorAlertController {

        getClass () {
            return `oui-inline-color-alert__label oui-inline-color-alert__${this.type}`;
        }
    }

    angular.module("managerApp")
        .component("ouiInlineColorAlert", {
            template: `
                <div class="oui-inline-color-alert">
                    <span data-ng-class="$ctrl.getClass()" data-ng-bind="$ctrl.label"></span>
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
