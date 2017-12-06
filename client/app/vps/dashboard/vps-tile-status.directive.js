angular.module("managerApp")
    .directive("vpsTileStatusItem", () => ({
        template: `
            <div class="vps-tile-status"
                 data-ng-show="$ctrl.item"
                 data-ng-class="{ 'vps-tile-status_grey' : $ctrl.striped}">
                <i class="oui-icon vps-tile-status__icon"
                   data-ng-class="{ 'oui-icon-success vps-tile-status__icon_success': $ctrl.item == 'OK',
                                    'oui-icon-error vps-tile-status__icon_error': $ctrl.item == 'KO'}"></i>
                <span class="vps-tile-status__text"
                      data-ng-bind="$ctrl.text"></span>

            </div>
        `,
        controller: class {},
        controllerAs: "$ctrl",
        transclude: true,
        replace: true,
        restrict: "E",
        scope: true,
        bindToController: {
            item: "<",
            text: "<",
            striped: "<"
        }
    }));
