(() => {
    "use strict";

    /*
     * Temporary implementation of skeleton.
     */
    class CuiLoaderController {
        $onInit () {
            this.size = this.size || "s";
        }
    }

    angular.module("managerApp")
        .component("cuiLoader", {
            template: `<div class="oui-loader oui-loader_{{$ctrl.size}}">
          <div class="oui-loader__container">
            <div class="oui-loader__image"></div>
          </div>
        </div>`,
            controller: CuiLoaderController,
            bindings: {
                size: "@"
            }
        });
})();
