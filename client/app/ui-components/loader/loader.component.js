(() => {
    "use strict";

    /*
     * Temporary implementation of skeleton.
     */
    class CuiLoaderController {
        $onInit () {
            this.size = this.size || "m";
        }
    }

    angular.module("managerApp")
        .component("cuiLoader", {
            template: `<div class="oui-spinner oui-spinner_{{$ctrl.size}}">
          <div class="oui-spinner__container">
            <div class="oui-spinner__image"></div>
          </div>
        </div>`,
            controller: CuiLoaderController,
            bindings: {
                size: "@"
            }
        });
})();
