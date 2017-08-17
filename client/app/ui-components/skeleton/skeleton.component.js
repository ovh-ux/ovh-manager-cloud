(() => {
    "use strict";

    /*
     * Temporary implementation of skeleton.
     */
    class CuiSkeletonController {
        $onInit = () => {
            this.width = this.width || `${Math.round(30 + Math.random() * 70)}%`;
        }
    }

    angular.module("managerApp")
        .component("cuiSkeleton", {
            template: `
                <div class="cui-skeleton">
                  <span class="cui-skeleton__loader"
                    ng-show="$ctrl.loading"
                    data-ng-style="{width: $ctrl.width}"></span>
                  <div ng-hide="$ctrl.loading" ng-transclude></div>
                </div>
            `,
            transclude: true,
            controller: CuiSkeletonController,
            bindings: {
                loading: "<",
                width: "@"
            }
        });
})();
