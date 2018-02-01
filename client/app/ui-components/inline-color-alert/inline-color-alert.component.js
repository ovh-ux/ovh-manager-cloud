(() => {
    "use strict";

    class OuiInlineColorAlertController {

        getClass () {
            if (this.type === "warning") {
                return "oui-inline-color-alert__warning";
            } else if (this.type === "error") {
                return "oui-inline-color-alert__error";
            } else if (this.type === "info") {
                return "oui-inline-color-alert__info";
            } else if (this.type === "primary") {
                return "oui-inline-color-alert__primary";
            } else if (this.type === "default") {
                return "oui-inline-color-alert__default";
            }
            return "";
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
