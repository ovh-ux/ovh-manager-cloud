(() => {
    "use strict";

    angular.module("managerApp")
        .component("cuiSwitch", {
            template: `
                <label class="oui-switch" data-ng-class="{'oui-switch_square' : $ctrl.square}">
                  <input type="checkbox" class="oui-switch__checkbox" data-ng-checked="$ctrl.checked">
                  <div class="oui-switch__slider"></div>
                  <i data-ng-if="$ctrl.icons" class="oui-icon oui-icon-success" aria-hidden="true"></i>
                  <i data-ng-if="$ctrl.icons" class="oui-icon oui-icon-error" aria-hidden="true"></i>
                </label>
            `,
            bindings: {
                checked: "=",
                icons: "<",
                square: "<"
            }
        });
})();

